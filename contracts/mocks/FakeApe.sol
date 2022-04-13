pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract FakeApe is ERC721, ERC721Enumerable {
    constructor() ERC721("Fake APES", "FAPES") {}

    uint256 lastMint = 0;

    function _baseURI() internal view override(ERC721) returns (string memory) {
        return
            "https://ipfs.io/ipfs/QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/";
    }

    function mint() public {
        require(lastMint < 10000, "All apes has been minted");
        _mint(msg.sender, lastMint);
        lastMint++;
    }

    function userTokens(address _userAddress)
        public
        view
        returns (uint256[] memory)
    {
        uint256[] memory tokens = new uint256[](balanceOf(_userAddress));
        for (uint256 i = 0; i < tokens.length; i++) {
            tokens[i] = tokenOfOwnerByIndex(_userAddress, i);
        }
        return tokens;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721Enumerable, ERC721) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721Enumerable, ERC721)
        returns (bool)
    {
        super.supportsInterface(interfaceId);
    }
}
