// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract UniversityHousing {

    /**
     * Struct that store a rent information
     * Id: Unique identificator for the rent
     * Owner: Address of the person who is the rent's owner
     * Renter: Address of the person who is "living" in the rent
     * City: city's name where the rent is lacated
     * RentAddress: Rent's address in the city
     * RentValue: rent value in dollars * 100000000 (rentValue = 100000000 is equal to 1 dollar)
     */
    struct Rent {
        uint id;
        address owner;
        address renter;
        string city;
        string rentAddress;
        uint rentValue;
    }

    AggregatorV3Interface internal priceFeed;
    using SafeMath for uint;

    uint public rentCount = 0;
    mapping(uint => Rent) public rents;
    

    // CONSTRUCTOR
    
    constructor() {
        priceFeed = AggregatorV3Interface(0x9326BFA02ADD2366b30bacB125260Af641031331);
    }


    // MODIFIERS

    modifier onlyOwner(uint _rentId) {
        require(msg.sender == rents[_rentId].owner, "The sender is not the rent owner");
        _;
    }

    modifier onlyRenter(uint _rentId) {
        require(msg.sender == rents[_rentId].renter, "The sender is not the the renter");
        _;
    }

    modifier validRendId(uint _rentId) {
        require(_rentId > 0 && _rentId <= rentCount, "The rent id given does not exist");
        _;
    }


    // FUNCTIONS

    function getRent(uint _rentId) public view validRendId(_rentId) returns (Rent memory) {
        return rents[_rentId];
    }

    function postRent(
        string memory _city,
        string memory _rentAddress,
        uint _rentValue
    ) public returns (uint) {
        rentCount++;
        rents[rentCount] = Rent(
            rentCount,
            msg.sender,
            address(0x0),
            _city,
            _rentAddress,
            _rentValue
        );
        return rentCount;
    }

    function updateRent(
        uint _rentId,
        string memory _city,
        string memory _rentAddress,
        uint _rentValue
    ) public onlyOwner(_rentId) validRendId(_rentId) returns (bool) {
        require(_rentValue != rents[_rentId].rentValue, "The new rent value must be different to the previous one");
        Rent storage rent = rents[_rentId];
        rent.city = _city;
        rent.rentAddress = _rentAddress;
        rent.rentValue = _rentValue;
        return true;
    }

    function takeRent(uint _rentId) public validRendId(_rentId) returns (bool) {
        require(rents[_rentId].renter == address(0x0), "The rent has already been taken");
        Rent storage rent = rents[_rentId];
        rent.renter = msg.sender;
        return true;
    }

    function leaveRent(uint _rentId) public onlyRenter(_rentId) validRendId(_rentId) returns(bool) {
        Rent storage rent = rents[_rentId];
        rent.renter = address(0x0);
        return true;
    }

    function payRent(uint _rentId) public payable onlyRenter(_rentId) validRendId(_rentId) returns(bool) {
        Rent memory _rent = rents[_rentId];

        uint256 price = getThePrice();
        uint256 _rentValue = uint256(1 ether).mul(_rent.rentValue).div(price);
        require(_rentValue <= msg.value, "The value must be greater or queals to the rent value");
        uint _change = msg.value.sub(_rentValue);
        payable(_rent.owner).transfer(_rentValue);
        payable(msg.sender).transfer(_change);
        return true;
    }

    function getThePrice() public view returns (uint256) {
        (
            uint80 roundID, 
            int price,
            uint startedAt,
            uint timeStamp,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();
        return uint256(price);
    }
}