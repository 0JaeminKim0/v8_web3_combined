// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title Investment Receipt SBT (Soul Bound Token)
 * @dev Non-transferable NFT representing investment contracts
 */
contract InvestmentReceiptSBT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    struct Investment {
        address investor;
        uint256 principal;
        uint256 targetAPY;
        uint256 startTime;
        uint256 maturityTime;
        string ipfsHash;
        string termsHash;
        string contractType;
        bool isActive;
    }

    mapping(uint256 => Investment) public investments;
    mapping(address => uint256[]) public investorTokens;

    event InvestmentCreated(
        uint256 indexed tokenId,
        address indexed investor,
        uint256 principal,
        uint256 targetAPY,
        string ipfsHash
    );

    constructor() ERC721("Investment Receipt SBT", "IRSBT") {}

    /**
     * @dev Mint new SBT for investment
     */
    function mintInvestment(
        address investor,
        uint256 targetAPY,
        uint256 durationMonths,
        string memory ipfsHash,
        string memory termsHash,
        string memory contractType
    ) external payable returns (uint256) {
        require(msg.value > 0, "Investment amount must be greater than 0");
        require(investor != address(0), "Invalid investor address");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        uint256 maturityTime = block.timestamp + (durationMonths * 30 days);

        investments[tokenId] = Investment({
            investor: investor,
            principal: msg.value,
            targetAPY: targetAPY,
            startTime: block.timestamp,
            maturityTime: maturityTime,
            ipfsHash: ipfsHash,
            termsHash: termsHash,
            contractType: contractType,
            isActive: true
        });

        investorTokens[investor].push(tokenId);

        _mint(investor, tokenId);

        emit InvestmentCreated(tokenId, investor, msg.value, targetAPY, ipfsHash);

        return tokenId;
    }

    /**
     * @dev Get investment details
     */
    function getInvestment(uint256 tokenId) external view returns (Investment memory) {
        require(_exists(tokenId), "Investment does not exist");
        return investments[tokenId];
    }

    /**
     * @dev Get all tokens owned by an investor
     */
    function getInvestorTokens(address investor) external view returns (uint256[] memory) {
        return investorTokens[investor];
    }

    /**
     * @dev Calculate current value of investment
     */
    function calculateCurrentValue(uint256 tokenId) external view returns (uint256) {
        require(_exists(tokenId), "Investment does not exist");
        Investment memory investment = investments[tokenId];
        
        if (!investment.isActive) return investment.principal;
        
        uint256 elapsed = block.timestamp - investment.startTime;
        uint256 duration = investment.maturityTime - investment.startTime;
        
        if (elapsed >= duration) {
            // Matured - return principal + full interest
            return investment.principal + (investment.principal * investment.targetAPY / 100);
        } else {
            // Pro-rated interest
            uint256 interest = (investment.principal * investment.targetAPY * elapsed) / (100 * duration);
            return investment.principal + interest;
        }
    }

    /**
     * @dev Override transfer functions to make tokens non-transferable (Soul Bound)
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        require(from == address(0) || to == address(0), "Soul Bound Tokens cannot be transferred");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    /**
     * @dev Withdraw contract balance (owner only)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }

    /**
     * @dev Get total supply of tokens
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter.current();
    }
}