// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract DebtNFT is ERC721, AccessControl {
    using Strings for uint256;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant FACTORY_ROLE = keccak256("FACTORY_ROLE");

    uint256 private _nextTokenId;

    struct DebtRecord {
        uint256 poolId;
        uint256 defaultedAmount;
        uint256 timestamp;
    }

    mapping(uint256 => DebtRecord) public debtRecords;
    mapping(address => uint256[]) public userDebts;

    event DebtNFTMinted(
        address indexed member,
        uint256 indexed tokenId,
        uint256 indexed poolId,
        uint256 defaultedAmount
    );

    constructor() ERC721("ArisanAman Debt Record", "DEBT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    function mint(
        address to,
        uint256 poolId,
        uint256 defaultedAmount
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);

        debtRecords[tokenId] = DebtRecord({
            poolId: poolId,
            defaultedAmount: defaultedAmount,
            timestamp: block.timestamp
        });

        userDebts[to].push(tokenId);

        emit DebtNFTMinted(to, tokenId, poolId, defaultedAmount);
        return tokenId;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);

        DebtRecord memory record = debtRecords[tokenId];

        string memory svg = _generateSVG(record, tokenId);

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "Debt Record #',
                        tokenId.toString(),
                        '", "description": "This NFT represents a default record in ArisanAman pool. This token is non-transferable and serves as a permanent on-chain record.", "image": "data:image/svg+xml;base64,',
                        Base64.encode(bytes(svg)),
                        '", "attributes": [{"trait_type": "Pool ID", "value": "',
                        record.poolId.toString(),
                        '"}, {"trait_type": "Defaulted Amount", "value": "',
                        record.defaultedAmount.toString(),
                        '"}, {"trait_type": "Timestamp", "value": "',
                        record.timestamp.toString(),
                        '"}, {"trait_type": "Type", "value": "Soulbound"}]}'
                    )
                )
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    function _generateSVG(DebtRecord memory record, uint256 tokenId) internal pure returns (string memory) {
        return string(
            abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" width="350" height="350">',
                '<defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">',
                '<stop offset="0%" style="stop-color:#1a1a2e"/>',
                '<stop offset="100%" style="stop-color:#16213e"/>',
                '</linearGradient></defs>',
                '<rect width="100%" height="100%" fill="url(#bg)"/>',
                '<rect x="10" y="10" width="330" height="330" rx="15" fill="none" stroke="#ef4444" stroke-width="2"/>',
                '<text x="175" y="50" text-anchor="middle" fill="#ef4444" font-size="24" font-weight="bold" font-family="Arial">DEBT RECORD</text>',
                '<text x="175" y="80" text-anchor="middle" fill="#666" font-size="10" font-family="Arial">SOULBOUND TOKEN</text>',
                '<line x1="50" y1="100" x2="300" y2="100" stroke="#333" stroke-width="1"/>',
                '<text x="175" y="140" text-anchor="middle" fill="#fff" font-size="14" font-family="Arial">Pool #',
                record.poolId.toString(),
                '</text>',
                '<text x="175" y="180" text-anchor="middle" fill="#fff" font-size="14" font-family="Arial">Amount Defaulted:</text>',
                '<text x="175" y="210" text-anchor="middle" fill="#ef4444" font-size="20" font-weight="bold" font-family="Arial">',
                record.defaultedAmount.toString(),
                ' IDRX</text>',
                '<text x="175" y="260" text-anchor="middle" fill="#666" font-size="10" font-family="Arial">Token #',
                tokenId.toString(),
                '</text>',
                '<text x="175" y="320" text-anchor="middle" fill="#ef4444" font-size="12" font-family="Arial">ArisanAman Default Record</text>',
                '</svg>'
            )
        );
    }

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("Soulbound: Transfer not allowed");
        }
        return super._update(to, tokenId, auth);
    }

    function getUserDebtCount(address user) external view returns (uint256) {
        return userDebts[user].length;
    }

    function getUserDebtTokens(address user) external view returns (uint256[] memory) {
        return userDebts[user];
    }

    function hasDebt(address user) external view returns (bool) {
        return userDebts[user].length > 0;
    }

    function grantMinterRole(address minter) external {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender) || hasRole(FACTORY_ROLE, msg.sender),
            "Not authorized"
        );
        _grantRole(MINTER_ROLE, minter);
    }

    function grantFactoryRole(address factory) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(FACTORY_ROLE, factory);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
