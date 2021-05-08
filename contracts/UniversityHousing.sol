// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "https://github.com/smartcontractkit/chainlink/blob/master/evm-contracts/src/v0.6/interfaces/AggregatorV3Interface.sol";

contract UniversityHousing {

    /**
     * Struct that store a rent information
     * Id: Unique identificator for the rent
     * Owner: Address of the person who is the rent's owner
     * Renter: Address of the person who is "living" in the rent
     * RentValue: rent value in dollars * 100 (rentValue = 100 is equal to 1 dollar)
     */
    struct Rent {
        uint id;
        address owner;
        address renter;
        uint rentValue;
    }

    AggregatorV3Interface internal priceFeed;

    uint public rentCount = 0;
    mapping(uint => Rent) public rents;
    

    // CONSTRUCTOR
    
    constructor() public {
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

    function postRent(uint _rentValue) public returns (uint) {
        rentCount++;
        rents[rentCount] = Rent(rentCount, msg.sender, address(0x0), _rentValue);
        return rentCount;
    }

    function changeRentValue(uint _rentId, uint _rentValue) public onlyOwner(_rentId) validRendId(_rentId) {
        require(_rentValue != rents[_rentId].rentValue, "The new rent value must be different to the previous one");
        Rent storage rent = rents[_rentId];
        rent.rentValue = _rentValue;
    }

    function takeRent(uint _rentId) public validRendId(_rentId) {
        require(rents[_rentId].renter == address(0x0), "The rent has already been taken");
        Rent storage rent = rents[_rentId];
        rent.renter = msg.sender;
    }

    function leaveRent(uint _rentId) public onlyRenter(_rentId) validRendId(_rentId) {
        Rent storage rent = rents[_rentId];
        rent.renter = address(0x0);
    }

    function payRent(uint _rentId) public payable onlyRenter(_rentId) validRendId(_rentId) {
        require(rents[_rentId].rentValue == msg.value, "The value send must be equal to the rent value");
        Rent memory _rent = rents[_rentId];
        payable(_rent.owner).transfer(msg.value);
    }
}