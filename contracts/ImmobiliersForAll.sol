pragma solidity ^0.5.0;

contract ImmobiliersForAll {
    string public name;
    uint256 public immobilierCount = 0;

    //stocker un Immobilier afin que l'on puisse le chercher par id : "immobilierCount"

    mapping(uint256 => Immobilier) public immobiliers;

    struct Immobilier {
        uint256 id;
        string name;
        uint256 price;
        string area;
        string localisation;
        string description;
        string image;
        address payable owner;
        bool purchased;
    }

    constructor() public {
        name = "Market-Place Immobilieres";
    }

    function createImb(
        string memory _name,
        uint256 _price,
        string memory _area,
        string memory _localisation,
        string memory _description,
        string memory _image
    ) public {
        require(bytes(_name).length > 0);
        require(bytes(_area).length > 0);
        require(bytes(_localisation).length > 0);
        require(bytes(_description).length > 0);
        require(bytes(_image).length > 0);
        require(_price > 0);

        immobilierCount++;
        //En Solidity, il existe des variables globales accessibles à toutes les fonctions. L'une d'elles est msg.sender,
        //qui faire référence à l'address de la personne (ou du smart contract) qui a appelée la fonction actuelle.
        immobiliers[immobilierCount] = Immobilier(
            immobilierCount,
            _name,
            _price,
            _area,
            _localisation,
            _description,
            _image,
            msg.sender,
            false
        );
    }

    // payable permet à une fonction de recevoir de l'éther
    function purchaseImb(uint256 _id) public payable {
        Immobilier memory _immobilier = immobiliers[_id];

        //Récupérer le vendeur
        address payable _seller = _immobilier.owner;

        require(_immobilier.id > 0 && _immobilier.id <= immobilierCount);
        //msg.value est membre de l'objet msg lors de l'envoi de transactions sur le réseau Ethereum.
        require(msg.value >= _immobilier.price);

        // le bien doit être non encore acheter par une autre personne
        require(!_immobilier.purchased);

        // le vendeur ne peut pas acheter ses biens
        require(_seller != msg.sender);

        _immobilier.owner = msg.sender;

        _immobilier.purchased = true;

        immobiliers[_id] = _immobilier;

        // l'acheteur envoie la somme demandé au vendeur
        address(_seller).transfer(msg.value);
    }
}
