// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CropRegistry {
    struct Crop {
        uint256 id;
        address farmer;
        string details;
    }

    mapping(uint256 => Crop) public crops;
    uint256 public cropCount;

    event CropRegistered(uint256 id, address indexed farmer, string details);

    function registerCrop(string memory _details) public {
        cropCount++;
        crops[cropCount] = Crop(cropCount, msg.sender, _details);
        emit CropRegistered(cropCount, msg.sender, _details);
    }
}
