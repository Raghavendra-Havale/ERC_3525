// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ERC3525.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract LeasingContract is Ownable {
    // using SafeMath for uint256;

    AssetRegistry public assetRegistry;
    uint256 lastBlockTimeStamp = 0;

    

    enum LeaseType {
        wetLease,
        dryLease
    }

    struct Lease {
        address lessee;
        uint256 assetId;
        LeaseType leaseType;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
    }

    mapping(uint256 => Lease) public leases;
    uint256 public leaseId;
    uint256 private holderDiscount;
    mapping(uint256 => uint256[]) public assetLeases;
    mapping(uint256 => uint256) public assetLeasePrice;
    mapping(address => mapping(uint256 => uint256)) public OwnerClaimBalance;
    mapping(address => bool) public ownerExists;

    event LeaseCreated(
        address indexed lessee,
        uint256 indexed leaseId,
        uint256 assetId,
        LeaseType leaseType,
        uint256 startTime,
        uint256 endTime,
        uint256 price
    );
    event LeaseTerminated(address indexed lessee, uint256 indexed leaseId);

    constructor(
        address _assetRegistryAddress,
        address _assetPriceoracle
    ) Ownable(msg.sender) {
        assetRegistry = AssetRegistry(_assetRegistryAddress);
        // assetPriceOracle = IAssetPriceOracle(_assetPriceoracle);
    }

    //Assuming the asset price is set in usd
    function createLease(
        address lessee,
        uint256 assetId,
        LeaseType leaseType,
        uint256 startTime,
        uint256 endTime
    ) public {
        require(
            endTime > startTime,
            "LeasingContract: End time must be after start time"
        );
        require(
            assetRegistry._slotExists(assetId),
            "LeasingContract: Invalid Asset Id"
        );
        uint256 duration = endTime - startTime;
        require(
            duration >= 157680000,
            "LeasingContract: Lease duration should be atleast 5 years"
        );
        require(assetRegistry.getAssetOwner(assetId)==msg.sender,"Not asset owner");
        uint256 durationInMonth = duration / 2628000;
        uint256 basePrice = assetLeasePrice[assetId] * (durationInMonth);

        if (leaseType == LeaseType.wetLease) {
            // every month the fees is collected
            uint256 maintenanceCharge = basePrice * (5)/(1000); // 0.5% per month
            basePrice = basePrice + (maintenanceCharge);
        }

        //holder discount interms of percentage
        uint256 discountAmount = basePrice * (holderDiscount)/(100);
        uint256 totalcostInUSD = basePrice - discountAmount;
        // uint256 totalCostInToken = totalcostInUSD /
        //     assetPriceOracle.getTokenPrice(tokenAddress);
        //price hardcoded for testing purposes
        uint256 totalCostInToken = totalcostInUSD /10;
        //transfet the cost interms of token to the user

        // IERC20(tokenAddress).approve(address(this), totalCostInToken);

        // IERC20(tokenAddress).transferFrom(
        //     lessee,
        //     address(this),
        //     totalCostInToken
        // );

        leaseId++;
        leases[leaseId] = Lease(
            lessee,
            assetId,
            leaseType,
            startTime,
            endTime,
            true
        );
        assetLeases[assetId].push(leaseId);
        //  distributeRent(assetId, totalCostInToken);
        emit LeaseCreated(
            lessee,
            leaseId,
            assetId,
            leaseType,
            startTime,
            endTime,
            totalcostInUSD
        );
    }

    // function terminateLease(uint256 _leaseId) public onlyOwner {
    //     require(leases[_leaseId].isActive, "LeasingContract: Lease is not active");
    //     leases[_leaseId].isActive = false;

    //     emit LeaseTerminated(leases[_leaseId].lessee, leaseId);
    // }

    //cost in interms of the transaction which user selected token
    function distributeRent(
        uint256 assetId,
        uint256 totalLeaseAmount
    ) public {
        address[] memory owners = assetRegistry.getAssetOwners(assetId);
        uint256 totalSupply = assetRegistry.getAssetTotalSupply(assetId);
        // require(lastBlockTimeStamp >= 2628000, "Less than one month");
        require(totalSupply > 0, "LeasingContract: No fractional owners");
        require(assetRegistry.getAssetOwner(assetId)==msg.sender,"Not asset owner");
         totalLeaseAmount=totalSupply;
        for (uint256 i = 0; i < owners.length; i++) {
            address owner = owners[i];
            uint256 ownerBalance = assetRegistry.getUserAssetTokenBalance(owner, assetId);

            if(ownerBalance > 0){
               uint256 rentPerToken = totalLeaseAmount/(totalSupply);
                 
                uint256 ownerShare = ownerBalance * rentPerToken;
                OwnerClaimBalance[owner][assetId] = ownerShare;
                ownerExists[owner] = true;
            }
           
        }
    }

    function setAssetLeasePrice(
        uint256 assetId,
        uint256 price
    ) public onlyOwner {
        require(
            assetRegistry._slotExists(assetId),
            "LeasingContract: Nonexistent token"
        );
        for (uint256 i = 0; i < assetLeases[assetId].length; i++) {
            require(
                !leases[assetLeases[assetId][i]].isActive,
                "LeasingContract: Cannot set price when Lease is active"
            );
        }

        assetLeasePrice[assetId] = price;
    }

    function getHolderDiscount() public view returns (uint256) {
    return holderDiscount;
}

function setHolderDiscount(uint256 _newDiscount) public {
    holderDiscount = _newDiscount;
}

    function claimFees(uint256 assetId) external {
    require(msg.sender != address(0), "Not a valid address");
    require(ownerExists[msg.sender], "Fractional Owner does not exist");
    
    uint256 ownerShare = OwnerClaimBalance[msg.sender][assetId];
    require(ownerShare > 0, "No claimable balance");

    // Convert the owner's share to tokens if necessary (logic to be added based on your token conversion logic)
    uint256 ownerShareInToken = ownerShare / 10; // Placeholder conversion logic

    // Reset the claim balance to 0 after claiming
    OwnerClaimBalance[msg.sender][assetId] = 0;

    // Logic to transfer the claimed amount to the user
    // For example, using IERC20 token interface (commented out as it depends on your specific implementation):
    // IERC20(_token).transfer(msg.sender, ownerShareInToken);
}

function getOwnerClaimBalance(address owner,uint256 slot)public view returns(uint256){
    return OwnerClaimBalance[owner][slot];
}
   
    receive() external payable {}
}