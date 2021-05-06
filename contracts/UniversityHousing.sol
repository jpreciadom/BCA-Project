// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract UniversityHousing {

    struct Rent {
        uint id;
        address owner;
        address renter;
        uint rentValue;
    }

    uint public rentCount = 0;
    mapping(uint => Rent) public rents;


    // MODIFIERS

    modifier onlyOwner(uint _rentId) {
        require(msg.sender == rents[_rentId].owner, "The sender is not the rent owner");
        _;
    }

    modifier onlyRenter(uint _rentId) {
        require(msg.sender == rents[_rentId].renter, "The sender is not the the renter");
        _;
    }


    // FUNCTIONS

    function getRent(uint _rentId) public view returns (Rent memory) {
        return rents[_rentId];
    }

    function postRent(uint _rentValue) public returns (uint) {
        rentCount++;
        rents[rentCount] = Rent(rentCount, msg.sender, address(0x0), _rentValue);
        return rentCount;
    }
    
    // function deleteRent(uint _rentId) public onlyOwner(_rentId) returns (bool) {
    //     return false;
    // }

    // function changeRentValue(uint _rentId, uint _rentValue) public onlyOwner(_rentId) returns (uint) {
    //     return 1000;
    // }

    // function takeRent(uint _rentId) public returns (uint) {
    //     return 1000;
    // }

    // function leaveRent(uint _rentId) onlyRenter(_rentId) public returns (bool) {
    //     return false;
    // }

    // function payRent(uint _rentId) payable onlyRenter(_rentId) public returns (bool) {
    //     return false;
    // }
}