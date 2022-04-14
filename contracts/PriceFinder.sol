//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./ABKoin.sol";
import "./AuctionHouse.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

contract PriceFinder is Initializable, ReentrancyGuardUpgradeable {
    /// ===== Constants ====
    uint256 public constant WAIT_PERIOD = 2 minutes;
    uint256 public constant SPECIALIST_FEE = 500;
    uint256 public constant SPECIALIST_FEE_DENOMINATOR = 10_000;
    uint256 public constant REPUTATION_MUL = 10_000;

    event RequestPrice(
        address indexed applicant,
        address collection,
        uint256 tokenId,
        uint256 indexed requestId
    );
    event RequestDropped(uint256 indexed requestId);

    event AcceptOffer(uint256 indexed requestId);

    event StakeSpecialist(address indexed sender, uint256 amount);
    event DeStakeSpecialist(address indexed sender, uint256 amount);

    event PricedAsset(
        uint256 indexed requestId,
        address indexed specialist,
        uint256 value
    );

    enum RequestStatus {
        WAITING,
        DROPPED,
        ACCPETED,
        SOLD
    }

    struct Offer {
        uint256 value;
        address specialist;
    }

    struct Request {
        address applicant;
        address collection;
        uint256 tokenId;
        RequestStatus status;
        uint256 createdAt;
    }

    struct RequestWithOffer {
        address applicant;
        address collection;
        uint256 tokenId;
        RequestStatus status;
        uint256 createdAt;
        uint256 offer;
    }

    struct Specialist {
        uint256 reputation;
        uint256 stakes;
        uint256 lockedWeight;
    }

    struct SepcialistReward {
        uint256 amount;
        address specialist;
    }

    Request[] public requests;
    mapping(uint256 => Offer[]) public requestOffers;
    mapping(address => Specialist) public specialists;

    ABKoin public ABK;
    AuctionHouse public auctionHouse;

    constructor() {}

    function initialize(address _ABKAddress, address _auctionHouseAddress)
        public
        initializer
    {
        ABK = ABKoin(_ABKAddress);
        auctionHouse = AuctionHouse(_auctionHouseAddress);
    }

    // Seller Methods

    function getRequest(uint256 _requestId)
        public
        view
        returns (Request memory)
    {
        return requests[_requestId];
    }

    function getRequests() public view returns (RequestWithOffer[] memory) {
        RequestWithOffer[] memory reqs = new RequestWithOffer[](
            requests.length
        );
        for (uint256 i = 0; i < requests.length; i++) {
            reqs[i] = RequestWithOffer(
                requests[i].applicant,
                requests[i].collection,
                requests[i].tokenId,
                requests[i].status,
                requests[i].createdAt,
                calculateAssetOffer(i)
            );
        }
        return reqs;
    }

    function getRequestsLength() public view returns (uint256) {
        return requests.length;
    }

    function requestPrice(address _nftAddress, uint256 _tokenId) public {
        // Transfer
        // TODO must implement safe transfer NFT
        IERC721 collection = IERC721(_nftAddress);
        collection.transferFrom(msg.sender, address(this), _tokenId);

        requests.push(
            Request({
                applicant: msg.sender,
                collection: _nftAddress,
                tokenId: _tokenId,
                status: RequestStatus.WAITING,
                createdAt: block.timestamp
            })
        );

        emit RequestPrice(
            msg.sender,
            _nftAddress,
            _tokenId,
            requests.length - 1
        );
    }

    function dropRequest(uint256 _requestId) public {
        Request storage request = requests[_requestId];
        require(request.applicant == msg.sender, "not owner");
        require(request.status == RequestStatus.WAITING);
        IERC721 collection = IERC721(request.collection);
        collection.transferFrom(
            address(this),
            request.applicant,
            request.tokenId
        );
        request.status = RequestStatus.DROPPED;
        freeLockedStake(_requestId);
        emit RequestDropped(_requestId);
    }

    function acceptOffer(uint256 _requestId) public nonReentrant {
        Request storage request = requests[_requestId];
        require(request.status == RequestStatus.WAITING);
        require(request.applicant == msg.sender, "not owner");
        require(block.timestamp > request.createdAt + WAIT_PERIOD, "must wait");
        uint256 offerPrice = calculateAssetOffer(_requestId);
        uint256 specilistsShare = (offerPrice * SPECIALIST_FEE) /
            SPECIALIST_FEE_DENOMINATOR;

        ABK.mint(request.applicant, offerPrice - specilistsShare);
        request.status = RequestStatus.ACCPETED;
        handleSpecialistFee(_requestId);
        /// Send NFT to the Auction House
        auctionHouse.startEnglishAuction(_requestId, offerPrice);
        emit AcceptOffer(_requestId);
    }

    /// Specialist Methods

    function getSpecialist(address _specialist)
        public
        view
        returns (Specialist memory)
    {
        return specialists[_specialist];
    }

    function stakeABK(uint256 amount) public nonReentrant {
        Specialist storage specialist = specialists[msg.sender];
        ABK.transferFrom(msg.sender, address(this), amount);
        if (specialist.reputation == 0) {
            specialist.reputation = 1 * REPUTATION_MUL;
        } else {
            uint256 currWeight = specialist.reputation * specialist.stakes;
            specialist.reputation =
                (currWeight + amount * REPUTATION_MUL) /
                specialist.stakes +
                amount;
        }
        specialist.stakes = specialist.stakes + amount;
        emit StakeSpecialist(msg.sender, amount);
    }

    function destakeABK(uint256 amount) public nonReentrant {
        Specialist storage specialist = specialists[msg.sender];
        require(calculateMaxDestaking(msg.sender) >= amount, "too much");
        ABK.transfer(msg.sender, amount);
        specialist.stakes -= amount;
        emit DeStakeSpecialist(msg.sender, amount);
    }

    function getSpecialistFreeWeight(address _specialist)
        public
        view
        returns (uint256)
    {
        Specialist memory specialist = specialists[_specialist];
        return
            specialist.stakes * specialist.reputation - specialist.lockedWeight;
    }

    function calculateMaxDestaking(address _specialist)
        public
        view
        returns (uint256)
    {
        Specialist memory specialist = specialists[_specialist];
        if (specialist.reputation == 0) return 0;
        uint256 currWeight = specialist.stakes * specialist.reputation;
        return (currWeight - specialist.lockedWeight) / specialist.reputation;
    }

    function priceAsset(uint256 _requestId, uint256 _suggestedPrice) public {
        require(_suggestedPrice > 0, "wrong suggest");
        Request memory request = requests[_requestId];
        require(request.status == RequestStatus.WAITING, "not active");
        require(
            getSpecialistFreeWeight(msg.sender) >
                _suggestedPrice * REPUTATION_MUL,
            "not enough weight"
        );
        requestOffers[_requestId].push(Offer(_suggestedPrice, msg.sender));
        Specialist storage specialist = specialists[msg.sender];
        specialist.lockedWeight += _suggestedPrice * specialist.reputation;
        emit PricedAsset(_requestId, msg.sender, _suggestedPrice);
    }

    function getAssetOffers(uint256 _requestId)
        public
        view
        returns (Offer[] memory offers)
    {
        return requestOffers[_requestId];
    }

    /// Only Auction house will be able to do this
    function finalizeRequest(
        uint256 _requestId,
        uint256 _finalPrice,
        address _buyer
    ) public {
        require(msg.sender == address(auctionHouse), "only auctionhouse");
        Request memory request = requests[_requestId];
        IERC721 collection = IERC721(request.collection);
        collection.transferFrom(address(this), _buyer, request.tokenId);
        adjustSpecialist(_requestId, _finalPrice);
    }

    /// Internal contract methods
    function adjustSpecialist(uint256 _requestId, uint256 _finalPrice) private {
        // TODO this function needs heavy auditing

        Offer[] memory offers = requestOffers[_requestId];
        uint256 assetOffer = calculateAssetOffer(_requestId);
        bool profitable = _finalPrice > assetOffer ? true : false;
        uint256 profit = profitable
            ? _finalPrice - assetOffer
            : assetOffer - _finalPrice;

        uint256 shareSum = offers.length * profit;
        uint256 burnsNeeded = 0;

        for (uint256 i = 0; i < offers.length; i++) {
            Specialist storage specialist = specialists[offers[i].specialist];
            //offers[i].value
            bool postivieImpact = _finalPrice > offers[i].value;
            uint256 priceDifference = postivieImpact
                ? _finalPrice - offers[i].value
                : offers[i].value - _finalPrice;
            uint256 specialistImpact = (profit *
                priceDifference *
                REPUTATION_MUL) / shareSum;
            uint256 currWeight = specialist.reputation * specialist.stakes;
            if (true) {
                specialist.reputation =
                    (currWeight + specialistImpact) /
                    specialist.stakes;
            } else {
                uint256 minReputationWeight = 1 *
                    REPUTATION_MUL *
                    specialist.stakes;
                if (currWeight - specialistImpact > minReputationWeight) {
                    specialist.reputation = 0;
                    (currWeight + specialistImpact) / specialist.stakes;
                } else {
                    specialist.reputation = 1 * REPUTATION_MUL;
                    uint256 endStake = (currWeight - specialistImpact) /
                        REPUTATION_MUL;
                    burnsNeeded += specialist.stakes - endStake;
                    specialist.stakes = endStake;
                }
            }
            if (burnsNeeded > 0) {
                ABK.burn(burnsNeeded);
            }
        }
    }

    function calculateAssetOffer(uint256 _requestId)
        public
        view
        returns (uint256)
    {
        Offer[] memory offers = requestOffers[_requestId];
        uint256 sumW = 0;
        uint256 sumWV = 0;
        for (uint256 i = 0; i < offers.length; i++) {
            Specialist memory specialist = specialists[offers[i].specialist];
            sumW += specialist.reputation;
            sumWV += specialist.reputation * offers[i].value;
        }
        return sumW == 0 ? 0 : sumWV / sumW;
    }

    function calculateSpecialistsRewards(uint256 _requestId)
        public
        view
        returns (SepcialistReward[] memory)
    {
        Offer[] memory offers = requestOffers[_requestId];
        uint256 offerPrice = calculateAssetOffer(_requestId);
        uint256 specilistsShare = (offerPrice * SPECIALIST_FEE) /
            SPECIALIST_FEE_DENOMINATOR;
        uint256 sumReputation = 0;
        for (uint256 i = 0; i < offers.length; i++) {
            sumReputation += specialists[offers[i].specialist].reputation;
        }

        SepcialistReward[] memory specilistsRewards = new SepcialistReward[](
            offers.length
        );
        for (uint256 i = 0; i < offers.length; i++) {
            specilistsRewards[i] = (
                SepcialistReward(
                    (specilistsShare *
                        specialists[offers[i].specialist].reputation) /
                        sumReputation,
                    offers[i].specialist
                )
            );
        }
        return specilistsRewards;
    }

    function handleSpecialistFee(uint256 _requestId) private {
        SepcialistReward[]
            memory specilistsRewards = calculateSpecialistsRewards(_requestId);
        uint256 total = 0;
        for (uint256 i = 0; i < specilistsRewards.length; i++) {
            Specialist storage specialist = specialists[
                specilistsRewards[i].specialist
            ];
            specialist.stakes += specilistsRewards[i].amount;
            total += specilistsRewards[i].amount;
        }
        ABK.mint(address(this), total);
    }

    function freeLockedStake(uint256 _requestId) private {
        Offer[] memory offers = requestOffers[_requestId];
        for (uint256 i = 0; i < offers.length; i++) {
            Specialist storage specialist = specialists[offers[i].specialist];
            specialist.lockedWeight -= offers[i].value * REPUTATION_MUL;
        }
    }

    /// View functions to get data from contract
    /// These are going to be removed probably and will use a subgraph instead
}
