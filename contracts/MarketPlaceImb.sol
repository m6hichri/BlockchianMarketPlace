pragma solidity ^0.5.0;

contract MarketPlaceImb {
  string public name;
  uint public immobiliereCount = 0;

  mapping(uint => Immobiliere) public immobilieres;

  struct Immobiliere {
    uint id;
    string name;
    uint price;
    address payable owner;
    bool purchased;
  }

  event ImbCreated(
    uint id,
    string name,
    uint price,
    address payable owner,
    bool purchased
  );

  event ImbPurchased(
    uint id,
    string name,
    uint price,
    address payable owner,
    bool purchased
);


  constructor() public {
    name = "Market-Place Immobilieres";
  }

  function createImb(string memory _name, uint _price) public {
    require(bytes(_name).length > 0);

    require(_price > 0);
 
    immobiliereCount ++;

    immobilieres[immobiliereCount] = Immobiliere(immobiliereCount, _name, _price, msg.sender,false);

    emit ImbCreated(immobiliereCount, _name, _price, msg.sender,false);

  }

  function purchaseImb(uint _id) public payable {
       
        Immobiliere memory _immobiliere = immobilieres[_id];
 
        address payable _seller = _immobiliere.owner;
 
        require(_immobiliere.id > 0 && _immobiliere.id <= immobiliereCount);
     
        require(msg.value >= _immobiliere.price);
 
        require(!_immobiliere.purchased);
  
        require(_seller != msg.sender);

        _immobiliere.owner = msg.sender;
 
        _immobiliere.purchased = true;
   
        immobilieres[_id] = _immobiliere;
  
        address(_seller).transfer(msg.value);

        emit ImbPurchased(immobiliereCount, _immobiliere.name, _immobiliere.price, msg.sender, true);
    }
}