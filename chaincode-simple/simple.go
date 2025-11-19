package main

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// SimpleContract for basic BPJS testing
type SimpleContract struct {
	contractapi.Contract
}

// Record represents a simple healthcare record
type Record struct {
	ID      string `json:"id"`
	Type    string `json:"type"`
	Data    string `json:"data"`
	Creator string `json:"creator"`
}

// CreateRecord adds a new record to the ledger
func (s *SimpleContract) CreateRecord(ctx contractapi.TransactionContextInterface, id string, recordType string, data string) error {
	record := Record{
		ID:      id,
		Type:    recordType,
		Data:    data,
		Creator: "BPJS",
	}

	recordJSON, err := json.Marshal(record)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, recordJSON)
}

// ReadRecord retrieves a record from the ledger
func (s *SimpleContract) ReadRecord(ctx contractapi.TransactionContextInterface, id string) (*Record, error) {
	recordJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if recordJSON == nil {
		return nil, fmt.Errorf("record %s does not exist", id)
	}

	var record Record
	err = json.Unmarshal(recordJSON, &record)
	if err != nil {
		return nil, err
	}

	return &record, nil
}

// RecordExists checks if a record exists
func (s *SimpleContract) RecordExists(ctx contractapi.TransactionContextInterface, id string) (bool, error) {
	recordJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %v", err)
	}

	return recordJSON != nil, nil
}

// GetAllRecords returns all records
func (s *SimpleContract) GetAllRecords(ctx contractapi.TransactionContextInterface) ([]*Record, error) {
	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var records []*Record
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var record Record
		err = json.Unmarshal(queryResponse.Value, &record)
		if err != nil {
			return nil, err
		}
		records = append(records, &record)
	}

	return records, nil
}

func main() {
	chaincode, err := contractapi.NewChaincode(&SimpleContract{})
	if err != nil {
		fmt.Printf("Error creating chaincode: %v", err)
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting chaincode: %v", err)
	}
}
