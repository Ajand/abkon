//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./ABKoin.sol";
import "./PriceFinder.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

/// @notice this contract will create an english auction for each accepeted price
/// If it sold it will handle the fees other wise it will change the auction into
/// a dutch auction
contract AuctionHouse is Initializable, ReentrancyGuardUpgradeable {
    /// ===== Constants ====
    uint256 public constant DURATION = 10 minutes;
    uint256 public constant ADD_TIME = 1 minutes;
    uint256 public constant MIN_PRICE = 0;

    ABKoin public ABK;
    PriceFinder public priceFinder;

    constructor() {}

    function initialize(address _ABKAddress, address _priceFinderAddress)
        public
        initializer
    {
        ABK = ABKoin(_ABKAddress);
        priceFinder = PriceFinder(_priceFinderAddress);
    }

    /// Let's do the english auction stuff here

    EnglishAuctionItem[] englishAuctions;
    /// englishRequestIdToAuctionId
    mapping(uint256 => uint256) private eritai;

    struct EnglishAuctionItem {
        uint256 requestId;
        uint256 endAt;
        uint256 startingBid;
        address highestBidder;
        uint256 highestBid;
        EnglishAuctionStatus status;
    }

    enum EnglishAuctionStatus {
        ACTIVE,
        ENDED,
        BIDDED
    }

    event EnglishAuctionItemCreated(
        uint256 indexed requestId,
        uint256 indexed auctionId,
        uint256 startinBid
    );

    event EnglishAuctionItemBidded(uint256 indexed auctionId, uint256 bid);
    event EnglishAuctionEnded(uint256 indexed auctionId, uint256 finishedBid);

    /// Start English Auction
    function startEnglishAuction(uint256 _requestId, uint256 _startingBid)
        public
    {
        require(msg.sender == address(priceFinder), "only pricefinder");
        englishAuctions.push(
            EnglishAuctionItem(
                _requestId,
                block.timestamp + DURATION,
                _startingBid,
                address(0),
                0,
                EnglishAuctionStatus.ACTIVE
            )
        );
        eritai[_requestId] = englishAuctions.length - 1;
        emit EnglishAuctionItemCreated(
            _requestId,
            englishAuctions.length - 1,
            _startingBid
        );
    }

    /// Get English Auction
    function getEnglishAuction(uint256 auctionId)
        public
        view
        returns (EnglishAuctionItem memory)
    {
        return englishAuctions[auctionId];
    }

    /// Get English Auctions
    function getEnglishAuctions()
        public
        view
        returns (EnglishAuctionItem[] memory)
    {
        return englishAuctions;
    }

    /// Bid English Auction
    function bidEnglishAuction(uint256 _auctionId, uint256 _bid)
        public
        nonReentrant
    {
        EnglishAuctionItem storage auction = englishAuctions[_auctionId];

        require(auction.endAt > block.timestamp, "auction finished");

        require(auction.status != EnglishAuctionStatus.ENDED, "auction ended");

        require(msg.sender != auction.highestBidder, "already high bidder");

        if (auction.status == EnglishAuctionStatus.ACTIVE) {
            require(auction.startingBid < _bid, "not enough");
            auction.status = EnglishAuctionStatus.BIDDED;
        }

        if (auction.status == EnglishAuctionStatus.BIDDED) {
            require(auction.highestBid < _bid, "not enough");
            if (auction.highestBidder != address(0)) {
                ABK.transfer(auction.highestBidder, auction.highestBid);
            }
            ABK.transferFrom(msg.sender, address(this), _bid);
        }
        auction.highestBid = _bid;
        auction.highestBidder = msg.sender;

        if (auction.endAt - ADD_TIME < block.timestamp) {
            auction.endAt = block.timestamp + ADD_TIME;
        }

        emit EnglishAuctionItemBidded(_auctionId, _bid);
    }

    /// End English Auction
    function endEnglishAuction(uint256 _auctionId) public nonReentrant {
        EnglishAuctionItem storage auction = englishAuctions[_auctionId];
        require(block.timestamp > auction.endAt, "can't yet");
        if (auction.status == EnglishAuctionStatus.BIDDED) {
            priceFinder.finalizeRequest(
                auction.requestId,
                auction.highestBid,
                auction.highestBidder
            );
            ABK.burn(auction.highestBid);
        } else {
            startDutchAuction(auction.requestId, auction.startingBid);
            // Start a dutch auction
        }
        auction.status = EnglishAuctionStatus.ENDED;
        emit EnglishAuctionEnded(_auctionId, auction.highestBid);
    }

    /// End All Auctions
    function endAllEndedAuctions() public {
        for (uint256 i = 0; i < englishAuctions.length; i++) {
            if (
                EnglishAuctionStatus.ENDED != englishAuctions[i].status &&
                block.timestamp > englishAuctions[i].endAt
            ) {
                endEnglishAuction(i);
            }
        }
    }

    /// Let's do the dutch auction stuffs here

    struct DutchAuctionItem {
        uint256 requestId;
        uint256 initialPrice;
        uint256 startAt;
        uint256 boughtPrice;
        address buyer;
        DutchAuctionStatus status;
    }

    enum DutchAuctionStatus {
        ACTIVE,
        ENDED
    }

    DutchAuctionItem[] dutchAuctions;
    /// dutchRequestIdToAuctionId
    mapping(uint256 => uint256) private dritai;

    event DutchAuctionItemCreated(
        uint256 indexed requestId,
        uint256 indexed auctionId,
        uint256 initialPrice
    );

    event DutchAuctionItemBought(uint256 indexed auctionId, uint256 price);

    // get price
    function getDutchPrice(uint256 auctionId) public view returns (uint256) {
        DutchAuctionItem memory auction = dutchAuctions[auctionId];
        uint256 dp = auction.initialPrice - MIN_PRICE;
        uint256 ct = block.timestamp - auction.startAt;
        uint256 nominator = (ct * 1000) / DURATION;

        unchecked {
            require(dp > 0, "Initial price must be larger than min price");
            require(ct >= 0, "auction must be started");
            if (ct > DURATION) {
                return MIN_PRICE;
            }
            return auction.initialPrice - ((dp * (nominator)) / 1000);
        }
    }

    /// Start Dutch Auction
    function startDutchAuction(uint256 _requestId, uint256 _initialPrice)
        public
    {
        require(_initialPrice > MIN_PRICE, "less than min");

        dutchAuctions.push(
            DutchAuctionItem(
                _requestId,
                _initialPrice,
                block.timestamp + DURATION,
                0,
                address(0),
                DutchAuctionStatus.ACTIVE
            )
        );
        eritai[_requestId] = englishAuctions.length - 1;
        emit DutchAuctionItemCreated(
            _requestId,
            englishAuctions.length - 1,
            _initialPrice
        );
    }

    /// Buy dutch auction
    function buyDutchAuction(uint256 _auctionId) public nonReentrant {
        DutchAuctionItem storage auction = dutchAuctions[_auctionId];

        require(auction.status == DutchAuctionStatus.ACTIVE, "not active");

        uint256 auctionPrice = getDutchPrice(_auctionId);

        ABK.transferFrom(msg.sender, address(this), auctionPrice);

        priceFinder.finalizeRequest(
            auction.requestId,
            auctionPrice,
            msg.sender
        );
        ABK.burn(auctionPrice);

        auction.status = DutchAuctionStatus.ENDED;

        emit DutchAuctionItemBought(_auctionId, auctionPrice);
    }

    /// Get Dutch Auction
    function getDutchAuction(uint256 auctionId)
        public
        view
        returns (DutchAuctionItem memory)
    {
        return dutchAuctions[auctionId];
    }

    /// Get English Auctions
    function getDutchAuctions()
        public
        view
        returns (DutchAuctionItem[] memory)
    {
        return dutchAuctions;
    }
}
