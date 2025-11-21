package main

import (
	"encoding/json"
	"fmt"
	"testing"

	"github.com/hyperledger/fabric-chaincode-go/shim"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockTransactionContext is a mock for testing
type MockTransactionContext struct {
	contractapi.TransactionContext
	stub *MockStub
}

// MockStub is a mock stub for testing
type MockStub struct {
	mock.Mock
	State map[string][]byte
}

func (m *MockStub) GetState(key string) ([]byte, error) {
	args := m.Called(key)
	return args.Get(0).([]byte), args.Error(1)
}

func (m *MockStub) PutState(key string, value []byte) error {
	args := m.Called(key, value)
	m.State[key] = value
	return args.Error(0)
}

func (m *MockStub) CreateCompositeKey(objectType string, attributes []string) (string, error) {
	return fmt.Sprintf("%s~%s", objectType, attributes[0]), nil
}

func (m *MockStub) SetEvent(name string, payload []byte) error {
	return nil
}

func NewMockTransactionContext() *MockTransactionContext {
	stub := &MockStub{State: make(map[string][]byte)}
	ctx := &MockTransactionContext{stub: stub}
	return ctx
}

func (m *MockTransactionContext) GetStub() shim.ChaincodeStubInterface {
	return m.stub
}

func (m *MockTransactionContext) GetClientIdentity() shim.ClientIdentity {
	return &MockClientIdentity{}
}

type MockClientIdentity struct{}

func (m *MockClientIdentity) GetID() (string, error) {
	return "testUser", nil
}

func (m *MockClientIdentity) GetMSPID() (string, error) {
	return "BPJSMSP", nil
}

func (m *MockClientIdentity) GetAttributeValue(attrName string) (value string, found bool, err error) {
	return "", false, nil
}

func (m *MockClientIdentity) AssertAttributeValue(attrName, attrValue string) error {
	return nil
}

// Test IssueCard function
func TestIssueCard(t *testing.T) {
	contract := new(BPJSSmartContract)
	ctx := NewMockTransactionContext()

	// Mock GetState to return nil (card doesn't exist)
	ctx.stub.On("GetState", "CARD001").Return([]byte(nil), nil)
	ctx.stub.On("PutState", "CARD001", mock.Anything).Return(nil)
	ctx.stub.On("PutState", mock.Anything, []byte{0x00}).Return(nil) // composite key

	err := contract.IssueCard(ctx, "CARD001", "P001", "Budi Santoso", 
		"1234567890123456", "1990-01-01", "Male", "Jakarta", "PBI", 
		"2024-01-01", "2025-01-01")

	assert.NoError(t, err, "IssueCard should succeed")
	
	// Verify card was stored
	cardJSON := ctx.stub.State["CARD001"]
	assert.NotNil(t, cardJSON, "Card should be stored")

	var card BPJSCard
	json.Unmarshal(cardJSON, &card)
	assert.Equal(t, "CARD001", card.CardID)
	assert.Equal(t, "P001", card.PatientID)
	assert.Equal(t, "active", card.Status)
}

// Test IssueCard duplicate
func TestIssueCardDuplicate(t *testing.T) {
	contract := new(BPJSSmartContract)
	ctx := NewMockTransactionContext()

	existingCard := BPJSCard{CardID: "CARD001", PatientID: "P001"}
	existingJSON, _ := json.Marshal(existingCard)

	// Mock GetState to return existing card
	ctx.stub.On("GetState", "CARD001").Return(existingJSON, nil)

	err := contract.IssueCard(ctx, "CARD001", "P001", "Budi", 
		"1234567890123456", "1990-01-01", "Male", "Jakarta", "PBI",
		"2024-01-01", "2025-01-01")

	assert.Error(t, err, "Should return error for duplicate card")
	assert.Contains(t, err.Error(), "already exists")
}

// Test VerifyCard
func TestVerifyCard(t *testing.T) {
	contract := new(BPJSSmartContract)
	ctx := NewMockTransactionContext()

	card := BPJSCard{
		CardID:    "CARD001",
		PatientID: "P001",
		Status:    "active",
	}
	cardJSON, _ := json.Marshal(card)

	ctx.stub.On("GetState", "CARD001").Return(cardJSON, nil)

	result, err := contract.VerifyCard(ctx, "CARD001")

	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, "CARD001", result.CardID)
	assert.Equal(t, "active", result.Status)
}

// Test VerifyCard with inactive card
func TestVerifyCardInactive(t *testing.T) {
	contract := new(BPJSSmartContract)
	ctx := NewMockTransactionContext()

	card := BPJSCard{
		CardID:    "CARD001",
		PatientID: "P001",
		Status:    "suspended",
	}
	cardJSON, _ := json.Marshal(card)

	ctx.stub.On("GetState", "CARD001").Return(cardJSON, nil)

	result, err := contract.VerifyCard(ctx, "CARD001")

	assert.Error(t, err)
	assert.Nil(t, result)
	assert.Contains(t, err.Error(), "not active")
}

// Test UpdateCardStatus
func TestUpdateCardStatus(t *testing.T) {
	contract := new(BPJSSmartContract)
	ctx := NewMockTransactionContext()

	card := BPJSCard{
		CardID:    "CARD001",
		PatientID: "P001",
		Status:    "active",
	}
	cardJSON, _ := json.Marshal(card)

	ctx.stub.On("GetState", "CARD001").Return(cardJSON, nil)
	ctx.stub.On("PutState", "CARD001", mock.Anything).Return(nil)
	ctx.stub.On("PutState", mock.Anything, mock.Anything).Return(nil) // audit log

	err := contract.UpdateCardStatus(ctx, "CARD001", "suspended", "Payment overdue")

	assert.NoError(t, err)

	// Verify status was updated
	updatedJSON := ctx.stub.State["CARD001"]
	var updatedCard BPJSCard
	json.Unmarshal(updatedJSON, &updatedCard)
	assert.Equal(t, "suspended", updatedCard.Status)
}

// Test RecordVisit
func TestRecordVisit(t *testing.T) {
	contract := new(BPJSSmartContract)
	ctx := NewMockTransactionContext()

	// Setup active card
	card := BPJSCard{
		CardID:    "CARD001",
		PatientID: "P001",
		Status:    "active",
	}
	cardJSON, _ := json.Marshal(card)

	ctx.stub.On("GetState", "CARD001").Return(cardJSON, nil)
	ctx.stub.On("GetState", "VISIT001").Return([]byte(nil), nil)
	ctx.stub.On("PutState", "VISIT001", mock.Anything).Return(nil)
	ctx.stub.On("PutState", mock.Anything, mock.Anything).Return(nil)

	err := contract.RecordVisit(ctx, "VISIT001", "CARD001", "P001", "Budi",
		"RS001", "RS Siloam", "rumahsakit", "2024-01-15", "outpatient",
		"Flu", "Medicine prescribed", "Dr. Smith", "DOC001", "Regular checkup")

	assert.NoError(t, err)

	// Verify visit was stored
	visitJSON := ctx.stub.State["VISIT001"]
	assert.NotNil(t, visitJSON)
	
	var visit Visit
	json.Unmarshal(visitJSON, &visit)
	assert.Equal(t, "VISIT001", visit.VisitID)
	assert.Equal(t, "P001", visit.PatientID)
}

// Test RecordVisit with inactive card
func TestRecordVisitInactiveCard(t *testing.T) {
	contract := new(BPJSSmartContract)
	ctx := NewMockTransactionContext()

	card := BPJSCard{
		CardID:    "CARD001",
		PatientID: "P001",
		Status:    "suspended",
	}
	cardJSON, _ := json.Marshal(card)

	ctx.stub.On("GetState", "CARD001").Return(cardJSON, nil)

	err := contract.RecordVisit(ctx, "VISIT001", "CARD001", "P001", "Budi",
		"RS001", "RS Siloam", "rumahsakit", "2024-01-15", "outpatient",
		"Flu", "Medicine", "Dr. Smith", "DOC001", "Notes")

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "not active")
}

// Test SubmitClaim
func TestSubmitClaim(t *testing.T) {
	contract := new(BPJSSmartContract)
	ctx := NewMockTransactionContext()

	// Setup active card
	card := BPJSCard{
		CardID:    "CARD001",
		PatientID: "P001",
		Status:    "active",
	}
	cardJSON, _ := json.Marshal(card)

	ctx.stub.On("GetState", "CARD001").Return(cardJSON, nil)
	ctx.stub.On("PutState", "CLAIM001", mock.Anything).Return(nil)
	ctx.stub.On("PutState", mock.Anything, mock.Anything).Return(nil)

	err := contract.SubmitClaim(ctx, "CLAIM001", "P001", "Budi", "CARD001", "VISIT001",
		"RS001", "RS Siloam", "rawat-jalan", "2024-01-15",
		"Flu", "Consultation and medicine", 500000, 450000)

	assert.NoError(t, err)

	// Verify claim was stored
	claimJSON := ctx.stub.State["CLAIM001"]
	assert.NotNil(t, claimJSON)

	var claim Claim
	json.Unmarshal(claimJSON, &claim)
	assert.Equal(t, "CLAIM001", claim.ClaimID)
	assert.Equal(t, "submitted", claim.Status)
	assert.Equal(t, 450000.0, claim.ClaimAmount)
}

// Test ProcessClaim approve
func TestProcessClaimApprove(t *testing.T) {
	contract := new(BPJSSmartContract)
	ctx := NewMockTransactionContext()

	claim := Claim{
		ClaimID:   "CLAIM001",
		PatientID: "P001",
		Status:    "submitted",
	}
	claimJSON, _ := json.Marshal(claim)

	ctx.stub.On("GetState", "CLAIM001").Return(claimJSON, nil)
	ctx.stub.On("PutState", "CLAIM001", mock.Anything).Return(nil)
	ctx.stub.On("PutState", mock.Anything, mock.Anything).Return(nil)

	err := contract.ProcessClaim(ctx, "CLAIM001", "approved", "All documents verified")

	assert.NoError(t, err)

	// Verify status updated
	updatedJSON := ctx.stub.State["CLAIM001"]
	var updatedClaim Claim
	json.Unmarshal(updatedJSON, &updatedClaim)
	assert.Equal(t, "approved", updatedClaim.Status)
	assert.NotEmpty(t, updatedClaim.PaymentDate)
}

// Test ProcessClaim reject
func TestProcessClaimReject(t *testing.T) {
	contract := new(BPJSSmartContract)
	ctx := NewMockTransactionContext()

	claim := Claim{
		ClaimID:   "CLAIM001",
		PatientID: "P001",
		Status:    "submitted",
	}
	claimJSON, _ := json.Marshal(claim)

	ctx.stub.On("GetState", "CLAIM001").Return(claimJSON, nil)
	ctx.stub.On("PutState", "CLAIM001", mock.Anything).Return(nil)
	ctx.stub.On("PutState", mock.Anything, mock.Anything).Return(nil)

	err := contract.ProcessClaim(ctx, "CLAIM001", "rejected", "Incomplete documentation")

	assert.NoError(t, err)

	updatedJSON := ctx.stub.State["CLAIM001"]
	var updatedClaim Claim
	json.Unmarshal(updatedJSON, &updatedClaim)
	assert.Equal(t, "rejected", updatedClaim.Status)
	assert.Empty(t, updatedClaim.PaymentDate)
}

// Test CreateReferral
func TestCreateReferral(t *testing.T) {
	contract := new(BPJSSmartContract)
	ctx := NewMockTransactionContext()

	card := BPJSCard{
		CardID:    "CARD001",
		PatientID: "P001",
		Status:    "active",
	}
	cardJSON, _ := json.Marshal(card)

	ctx.stub.On("GetState", "CARD001").Return(cardJSON, nil)
	ctx.stub.On("PutState", "REF001", mock.Anything).Return(nil)
	ctx.stub.On("PutState", mock.Anything, mock.Anything).Return(nil)

	err := contract.CreateReferral(ctx, "REF001", "P001", "Budi", "CARD001",
		"PKM001", "Puskesmas Kelapa", "RS001", "RS Siloam",
		"Need specialist", "Complex case", "Dr. Lee",
		"2024-01-15", "2024-02-15", "Urgent referral")

	assert.NoError(t, err)

	referralJSON := ctx.stub.State["REF001"]
	assert.NotNil(t, referralJSON)

	var referral Referral
	json.Unmarshal(referralJSON, &referral)
	assert.Equal(t, "REF001", referral.ReferralID)
	assert.Equal(t, "pending", referral.Status)
}

// Test UpdateReferralStatus
func TestUpdateReferralStatus(t *testing.T) {
	contract := new(BPJSSmartContract)
	ctx := NewMockTransactionContext()

	referral := Referral{
		ReferralID: "REF001",
		PatientID:  "P001",
		Status:     "pending",
	}
	referralJSON, _ := json.Marshal(referral)

	ctx.stub.On("GetState", "REF001").Return(referralJSON, nil)
	ctx.stub.On("PutState", "REF001", mock.Anything).Return(nil)
	ctx.stub.On("PutState", mock.Anything, mock.Anything).Return(nil)

	err := contract.UpdateReferralStatus(ctx, "REF001", "accepted", "Dr. Wong", "Patient scheduled for tomorrow")

	assert.NoError(t, err)

	updatedJSON := ctx.stub.State["REF001"]
	var updatedReferral Referral
	json.Unmarshal(updatedJSON, &updatedReferral)
	assert.Equal(t, "accepted", updatedReferral.Status)
	assert.Equal(t, "Dr. Wong", updatedReferral.AcceptedBy)
}
