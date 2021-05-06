const UniversityHousing = artifacts.require('./UniversityHousing.sol');

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('UniversityHousing', ([owner1, owner2, renter1, renter2, none]) => {

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
            rent = await universityHousing.getRent(rentCount + 1)
            assert.equal(rent.id, 0)
            assert.equal(rent.owner, 0x0)
            assert.equal(rent.rentValue, 0)
        })
    })
});