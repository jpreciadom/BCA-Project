const { assert } = require('chai');

const UniversityHousing = artifacts.require('./UniversityHousing.sol');

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('UniversityHousing', ([owner1, owner2, renter1, renter2]) => {

    let universityHousing;

    before(async () => {
        universityHousing = await UniversityHousing.deployed()
    })

    describe('deployment', async () => {
        it('deploys successfully', async () => {
            const address = await universityHousing.address
            assert.notEqual(address, 0x0)
            assert.notEqual(address, '')
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })
    })

    describe('Rent', async () => {
        let rentCount, rent

        it('Offer a rent', async () => {
            await universityHousing.postRent(10, { from: owner1 })
            rentCount = await universityHousing.rentCount()
            rent = await universityHousing.getRent(rentCount)

            // SUCCESS
            assert.equal(rent.id, rentCount)
            assert.equal(rent.owner, owner1)
            assert.equal(rent.renter, 0x0)
            assert.equal(rent.rentValue, 10)
        })

        it('Get a rent by id', async () => {
            await universityHousing.postRent(10, { from: owner1 })
            rentCount = await universityHousing.rentCount()
            
            // The rent in on the map
            rent = await universityHousing.getRent(rentCount)
            assert.notEqual(rent.id, 0)
            assert.notEqual(rent.owner, 0x0)
            assert.notEqual(rent.rentValue, 0)

            // The rent is not on the map
            rent = await universityHousing.getRent(rentCount + 1).should.be.rejected
        })

        it('Take a rent', async () => {
            await universityHousing.postRent(10, { from: owner1 })
            rentCount = await universityHousing.rentCount()

            // SUCCESS
            await universityHousing.takeRent(rentCount, { from: renter1 })
            rent = await universityHousing.getRent(rentCount)
            assert.equal(rent.renter, renter1)

            // FAILURE - The rent has already been taken
            await universityHousing.takeRent(rentCount, { from: renter2 }).should.be.rejected
            rent = await universityHousing.getRent(rentCount)
            assert.notEqual(rent.renter, renter2)
            assert.equal(rent.renter, renter1)

            // FAILURE - The rent does not exist
            await universityHousing.takeRent(rentCount + 1, { from: renter1 }).should.be.rejected
        })
    })

    describe('Owner options', async () => {
        let rentCount, rent

        it('Change the rent value', async () => {
            let firstRentValue = 1000
            let secondRentValue = 2000
            let thirdRentValue = 3000

            await universityHousing.postRent(firstRentValue, { from: owner1 })
            rentCount = await universityHousing.rentCount()

            // SUCCESS
            await universityHousing.changeRentValue(rentCount, secondRentValue, { from: owner1 })
            rent = await universityHousing.getRent(rentCount)
            assert.notEqual(rent.rentValue, firstRentValue)
            assert.equal(rent.rentValue, secondRentValue)

            // FAILURE - sender is not the owner
            await universityHousing.changeRentValue(rentCount, thirdRentValue, { from: owner2 }).should.be.rejected
            rent = await universityHousing.getRent(rentCount)
            assert.equal(rent.rentValue, secondRentValue)
            assert.notEqual(rent.rentValue, thirdRentValue)

            // FAILURE - the new value is equal to the previous one
            await universityHousing.changeRentValue(rentCount, secondRentValue, { from: owner1 }).should.be.rejected

            // FAILURE - The rent does not exist
            await universityHousing.changeRentValue(rentCount + 1, secondRentValue, { from: owner1 }).should.be.rejected
        })
    })

    describe('Renter options', async () => {
        let rentCount, rent

        it('Leave rent', async () => {
            await universityHousing.postRent(10, { from: owner1 })
            rentCount = await universityHousing.rentCount()

            // SUCCESS
            await universityHousing.takeRent(rentCount, { from: renter1 })
            await universityHousing.leaveRent(rentCount, { from: renter1 })
            rent = await universityHousing.getRent(rentCount)
            assert.equal(rent.renter, 0x0)

            // FAILURE - Sender is not the renter
            await universityHousing.takeRent(rentCount, { from: renter1 })
            await universityHousing.leaveRent(rentCount, { from: renter2 }).should.be.rejected
            rent = await universityHousing.getRent(rentCount)
            assert.notEqual(rent.renter, 0x0)
            assert.equal(rent.renter, renter1)

            // FAILURE - The rent does not exist
            await universityHousing.takeRent(rentCount + 1, { from: renter1 }).should.be.rejected
        })

        it('Pay the rent', async () => {
            let oldOwnerBalance, newOwnerBalance, expectedOwnerBalance
            let rentValue
            rentValue = web3.utils.toWei('1', 'Ether')
            await universityHousing.postRent(rentValue, { from: owner1 })
            rentCount = await universityHousing.rentCount()
            await universityHousing.takeRent(rentCount, { from: renter1 })

            // SUCCESS
            oldOwnerBalance = await web3.eth.getBalance(owner1)
            oldOwnerBalance = new web3.utils.BN(oldOwnerBalance)
            await universityHousing.payRent(rentCount, { from: renter1, value: rentValue })
            newOwnerBalance = await web3.eth.getBalance(owner1)
            newOwnerBalance = new web3.utils.BN(newOwnerBalance)
            expectedOwnerBalance = oldOwnerBalance.add(new web3.utils.BN(rentValue))
            assert.equal(expectedOwnerBalance.toString(), newOwnerBalance.toString())

            // FAILURE - The sender is not the renter
            oldOwnerBalance = await web3.eth.getBalance(owner1)
            oldOwnerBalance = new web3.utils.BN(oldOwnerBalance)
            await universityHousing.payRent(rentCount, { from: renter2, value: rentValue }).should.be.rejected
            newOwnerBalance = await web3.eth.getBalance(owner1)
            newOwnerBalance = new web3.utils.BN(newOwnerBalance)
            assert.equal(newOwnerBalance.toString(), oldOwnerBalance.toString())

            // FAILURE - The rent does not exist
            oldOwnerBalance = await web3.eth.getBalance(owner1)
            oldOwnerBalance = new web3.utils.BN(oldOwnerBalance)
            await universityHousing.payRent(rentCount + 1, { from: renter1, value: rentValue }).should.be.rejected
            newOwnerBalance = await web3.eth.getBalance(owner1)
            newOwnerBalance = new web3.utils.BN(newOwnerBalance)
            assert.equal(newOwnerBalance.toString(), oldOwnerBalance.toString())
        })
    })
});