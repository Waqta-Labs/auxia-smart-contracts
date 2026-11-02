// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title DeliveryRegistry
/// @notice Anchors the SHA-256 hash of each AuxIA aid delivery so anyone can
/// check that the delivery record kept off chain was not altered.
/// @dev Only the delivery identifier and its hash are stored: never names,
/// documents, quantities or any data about beneficiaries. The owner is the
/// wallet of auxia-backend, the only account allowed to register deliveries.
contract DeliveryRegistry is Ownable {
    /// @notice Emitted when the hash of a delivery is anchored.
    event DeliveryRegistered(bytes16 indexed deliveryId, bytes32 hash, uint256 timestamp);

    /// @notice The delivery identifier is zero.
    error InvalidDeliveryId();

    /// @notice The hash is zero.
    error EmptyHash();

    /// @notice The delivery already has an anchored hash, which cannot be overwritten.
    error DeliveryAlreadyRegistered(bytes16 deliveryId);

    mapping(bytes16 deliveryId => bytes32 hash) private deliveryHashes;

    constructor() Ownable(msg.sender) {}

    /// @notice Anchors the hash of a delivery.
    /// @param deliveryId UUID of the delivery in binary form.
    /// @param hash SHA-256 hash of the canonical delivery record.
    function registerDelivery(bytes16 deliveryId, bytes32 hash) external onlyOwner {
        if (deliveryId == bytes16(0)) revert InvalidDeliveryId();
        if (hash == bytes32(0)) revert EmptyHash();
        if (deliveryHashes[deliveryId] != bytes32(0)) revert DeliveryAlreadyRegistered(deliveryId);

        deliveryHashes[deliveryId] = hash;
        emit DeliveryRegistered(deliveryId, hash, block.timestamp);
    }

    /// @notice Returns the anchored hash of a delivery, or zero if it was never registered.
    /// @param deliveryId UUID of the delivery in binary form.
    function getDeliveryHash(bytes16 deliveryId) external view returns (bytes32) {
        return deliveryHashes[deliveryId];
    }
}
