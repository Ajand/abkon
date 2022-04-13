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
    uint256 public constant addTime = 1 minutes;

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
    /// englishAuctionIdToRequestId
    mapping(uint256 => uint256) private eaitri;

    struct EnglishAuctionItem {
        uint256 requestId;
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

    /// Start English Auction
    function startEnglishAuction(uint256 _requestId, uint256 _startingBid)
        public
    {
        englishAuctions.push(
            EnglishAuctionItem(
                _requestId,
                _startingBid,
                address(0),
                0,
                EnglishAuctionStatus.ACTIVE
            )
        );
        eaitri[englishAuctions.length - 1] = _requestId;
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
    /// End English Auction
    /// End All Auctions

    /// Let's do the dutch auction stuffs here
    /// Get dutch auction price
    /// Start Dutch Auction
    /// Buy dutch auction
}
