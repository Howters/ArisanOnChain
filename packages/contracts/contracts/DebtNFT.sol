// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract DebtNFT is ERC721, AccessControl {
    using Strings for uint256;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

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

        string memory svg = string(
            abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" width="350" height="350">',
                '<rect width="100%" height="100%" fill="#1a1a1a"/>',
                '<text x="175" y="50" text-anchor="middle" fill="#ef4444" font-size="24" font-weight="bold">DEBT RECORD</text>',
                '<text x="175" y="120" text-anchor="middle" fill="#fff" font-size="16">Pool #',
                record.poolId.toString(),
                "</text>",
                '<text x="175" y="160" text-anchor="middle" fill="#fff" font-size="16">Amount: ',
                record.defaultedAmount.toString(),
                " IDRX</text>",
                '<text x="175" y="200" text-anchor="middle" fill="#666" font-size="12">Token #',
                tokenId.toString(),
                "</text>",
                '<text x="175" y="320" text-anchor="middle" fill="#ef4444" font-size="14">ArisanAman Default</text>',
                "</svg>"
            )
        );

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "Debt Record #',
                        tokenId.toString(),
                        '", "description": "This NFT represents a default record in ArisanAman pool.", "image": "data:image/svg+xml;base64,',
                        Base64.encode(bytes(svg)),
                        '", "attributes": [{"trait_type": "Pool ID", "value": "',
                        record.poolId.toString(),
                        '"}, {"trait_type": "Defaulted Amount", "value": "',
                        record.defaultedAmount.toString(),
                        '"}, {"trait_type": "Timestamp", "value": "',
                        record.timestamp.toString(),
                        '"}]}'
                    )
                )
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    function getUserDebtCount(address user) external view returns (uint256) {
        return userDebts[user].length;
    }

    function getUserDebtTokens(address user) external view returns (uint256[] memory) {
        return userDebts[user];
    }

    function grantMinterRole(address minter) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(MINTER_ROLE, minter);
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


