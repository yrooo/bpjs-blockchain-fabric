package main

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// BPJSSmartContract provides functions for managing BPJS healthcare system
type BPJSSmartContract struct {
	contractapi.Contract
}

// ===== DATA STRUCTURES =====

// BPJSCard represents digital BPJS card
type BPJSCard struct {
	CardID      string    `json:"cardID"`
	PatientID   string    `json:"patientID"`
	PatientName string    `json:"patientName"`
	NIK         string    `json:"nik"`
	DateOfBirth string    `json:"dateOfBirth"`
	Gender      string    `json:"gender"`
	Address     string    `json:"address"`
	Status      string    `json:"status"` // active, inactive, suspended
	CardType    string    `json:"cardType"` // PBI, Non-PBI
	IssueDate   string    `json:"issueDate"`
	ExpiryDate  string    `json:"expiryDate"`
	IssuedBy    string    `json:"issuedBy"`
	Timestamp   time.Time `json:"timestamp"`
}

// Visit represents patient visit to healthcare facility
type Visit struct {
	VisitID      string    `json:"visitID"`
	CardID       string    `json:"cardID"`
	PatientID    string    `json:"patientID"`
	PatientName  string    `json:"patientName"`
	FaskesCode   string    `json:"faskesCode"`
	FaskesName   string    `json:"faskesName"`
	FaskesType   string    `json:"faskesType"` // puskesmas, rumahsakit
	VisitDate    string    `json:"visitDate"`
	VisitType    string    `json:"visitType"` // outpatient, inpatient, emergency
	Diagnosis    string    `json:"diagnosis"`
	Treatment    string    `json:"treatment"`
	DoctorName   string    `json:"doctorName"`
	DoctorID     string    `json:"doctorID"`
	Notes        string    `json:"notes"`
	RecordedBy   string    `json:"recordedBy"`
	Timestamp    time.Time `json:"timestamp"`
}

// Referral represents patient referral between healthcare facilities
type Referral struct {
	ReferralID      string    `json:"referralID"`
	PatientID       string    `json:"patientID"`
	PatientName     string    `json:"patientName"`
	CardID          string    `json:"cardID"`
	FromFaskesCode  string    `json:"fromFaskesCode"`
	FromFaskesName  string    `json:"fromFaskesName"`
	ToFaskesCode    string    `json:"toFaskesCode"`
	ToFaskesName    string    `json:"toFaskesName"`
	ReferralReason  string    `json:"referralReason"`
	Diagnosis       string    `json:"diagnosis"`
	ReferringDoctor string    `json:"referringDoctor"`
	ReferralDate    string    `json:"referralDate"`
	ValidUntil      string    `json:"validUntil"`
	Status          string    `json:"status"` // pending, accepted, completed, expired
	AcceptedBy      string    `json:"acceptedBy"`
	AcceptedDate    string    `json:"acceptedDate"`
	Notes           string    `json:"notes"`
	CreatedBy       string    `json:"createdBy"`
	Timestamp       time.Time `json:"timestamp"`
}

// Claim represents insurance claim submission
type Claim struct {
	ClaimID       string    `json:"claimID"`
	PatientID     string    `json:"patientID"`
	PatientName   string    `json:"patientName"`
	CardID        string    `json:"cardID"`
	VisitID       string    `json:"visitID"`
	FaskesCode    string    `json:"faskesCode"`
	FaskesName    string    `json:"faskesName"`
	ClaimType     string    `json:"claimType"` // rawat-jalan, rawat-inap, emergency
	ServiceDate   string    `json:"serviceDate"`
	Diagnosis     string    `json:"diagnosis"`
	Treatment     string    `json:"treatment"`
	TotalAmount   float64   `json:"totalAmount"`
	ClaimAmount   float64   `json:"claimAmount"`
	Status        string    `json:"status"` // submitted, reviewing, approved, rejected, paid
	SubmittedBy   string    `json:"submittedBy"`
	SubmitDate    string    `json:"submitDate"`
	ReviewedBy    string    `json:"reviewedBy"`
	ReviewDate    string    `json:"reviewDate"`
	ReviewNotes   string    `json:"reviewNotes"`
	PaymentDate   string    `json:"paymentDate"`
	Timestamp     time.Time `json:"timestamp"`
}

// AuditLog represents audit trail entry
type AuditLog struct {
	LogID       string    `json:"logID"`
	Action      string    `json:"action"`
	EntityType  string    `json:"entityType"` // card, visit, referral, claim
	EntityID    string    `json:"entityID"`
	ActorID     string    `json:"actorID"`
	ActorRole   string    `json:"actorRole"`
	OrgID       string    `json:"orgID"`
	Description string    `json:"description"`
	IPAddress   string    `json:"ipAddress"`
	Timestamp   time.Time `json:"timestamp"`
}

// ===== CARD MANAGEMENT FUNCTIONS =====

// IssueCard creates a new BPJS card
func (s *BPJSSmartContract) IssueCard(ctx contractapi.TransactionContextInterface,
	cardID string, patientID string, patientName string, nik string,
	dateOfBirth string, gender string, address string, cardType string,
	issueDate string, expiryDate string) error {

	// Check if card already exists
	existing, err := ctx.GetStub().GetState(cardID)
	if err != nil {
		return fmt.Errorf("failed to read from world state: %v", err)
	}
	if existing != nil {
		return fmt.Errorf("card %s already exists", cardID)
	}

	// Get issuer identity
	issuer, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return fmt.Errorf("failed to get issuer identity: %v", err)
	}

	// Create card
	card := BPJSCard{
		CardID:      cardID,
		PatientID:   patientID,
		PatientName: patientName,
		NIK:         nik,
		DateOfBirth: dateOfBirth,
		Gender:      gender,
		Address:     address,
		Status:      "active",
		CardType:    cardType,
		IssueDate:   issueDate,
		ExpiryDate:  expiryDate,
		IssuedBy:    issuer,
		Timestamp:   time.Now(),
	}

	cardJSON, err := json.Marshal(card)
	if err != nil {
		return fmt.Errorf("failed to marshal card: %v", err)
	}

	err = ctx.GetStub().PutState(cardID, cardJSON)
	if err != nil {
		return fmt.Errorf("failed to put state: %v", err)
	}

	// Create composite key for querying by patientID
	indexName := "patientID~cardID"
	patientCardIndexKey, err := ctx.GetStub().CreateCompositeKey(indexName, []string{patientID, cardID})
	if err != nil {
		return err
	}
	err = ctx.GetStub().PutState(patientCardIndexKey, []byte{0x00})
	if err != nil {
		return err
	}

	// Emit event
	ctx.GetStub().SetEvent("CardIssued", []byte(fmt.Sprintf("Card %s issued to %s", cardID, patientName)))

	// Log audit
	return s.createAuditLog(ctx, "IssueCard", "card", cardID, issuer, "BPJS_ADMIN", 
		fmt.Sprintf("Issued BPJS card to %s", patientName))
}

// VerifyCard verifies card status and returns card details
func (s *BPJSSmartContract) VerifyCard(ctx contractapi.TransactionContextInterface, 
	cardID string) (*BPJSCard, error) {

	cardJSON, err := ctx.GetStub().GetState(cardID)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if cardJSON == nil {
		return nil, fmt.Errorf("card %s not found", cardID)
	}

	var card BPJSCard
	err = json.Unmarshal(cardJSON, &card)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal card: %v", err)
	}

	if card.Status != "active" {
		return nil, fmt.Errorf("card status is %s, not active", card.Status)
	}

	return &card, nil
}

// UpdateCardStatus updates card status (suspend, reactivate, etc.)
func (s *BPJSSmartContract) UpdateCardStatus(ctx contractapi.TransactionContextInterface,
	cardID string, newStatus string, reason string) error {

	cardJSON, err := ctx.GetStub().GetState(cardID)
	if err != nil || cardJSON == nil {
		return fmt.Errorf("card %s not found", cardID)
	}

	var card BPJSCard
	json.Unmarshal(cardJSON, &card)

	oldStatus := card.Status
	card.Status = newStatus
	card.Timestamp = time.Now()

	updatedJSON, _ := json.Marshal(card)
	err = ctx.GetStub().PutState(cardID, updatedJSON)
	if err != nil {
		return err
	}

	actor, _ := ctx.GetClientIdentity().GetID()
	return s.createAuditLog(ctx, "UpdateCardStatus", "card", cardID, actor, "BPJS_ADMIN",
		fmt.Sprintf("Status changed from %s to %s. Reason: %s", oldStatus, newStatus, reason))
}

// ===== VISIT RECORDING FUNCTIONS =====

// RecordVisit records a patient visit at healthcare facility
func (s *BPJSSmartContract) RecordVisit(ctx contractapi.TransactionContextInterface,
	visitID string, cardID string, patientID string, patientName string,
	faskesCode string, faskesName string, faskesType string,
	visitDate string, visitType string, diagnosis string, treatment string,
	doctorName string, doctorID string, notes string) error {

	// Verify card is active
	card, err := s.VerifyCard(ctx, cardID)
	if err != nil {
		return fmt.Errorf("card verification failed: %v", err)
	}

	// Check if patient matches card
	if card.PatientID != patientID {
		return fmt.Errorf("patient ID mismatch")
	}

	recorder, _ := ctx.GetClientIdentity().GetID()

	visit := Visit{
		VisitID:     visitID,
		CardID:      cardID,
		PatientID:   patientID,
		PatientName: patientName,
		FaskesCode:  faskesCode,
		FaskesName:  faskesName,
		FaskesType:  faskesType,
		VisitDate:   visitDate,
		VisitType:   visitType,
		Diagnosis:   diagnosis,
		Treatment:   treatment,
		DoctorName:  doctorName,
		DoctorID:    doctorID,
		Notes:       notes,
		RecordedBy:  recorder,
		Timestamp:   time.Now(),
	}

	visitJSON, _ := json.Marshal(visit)
	err = ctx.GetStub().PutState(visitID, visitJSON)
	if err != nil {
		return err
	}

	// Create composite key for querying visits by patient
	indexName := "patientID~visitID"
	indexKey, _ := ctx.GetStub().CreateCompositeKey(indexName, []string{patientID, visitID})
	ctx.GetStub().PutState(indexKey, []byte{0x00})

	ctx.GetStub().SetEvent("VisitRecorded", []byte(fmt.Sprintf("Visit %s recorded for %s", visitID, patientName)))

	return s.createAuditLog(ctx, "RecordVisit", "visit", visitID, recorder, "FASKES_STAFF",
		fmt.Sprintf("Recorded visit for %s at %s", patientName, faskesName))
}

// GetPatientVisits retrieves all visits for a patient
func (s *BPJSSmartContract) GetPatientVisits(ctx contractapi.TransactionContextInterface,
	patientID string) ([]*Visit, error) {

	resultsIterator, err := ctx.GetStub().GetStateByPartialCompositeKey("patientID~visitID", []string{patientID})
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var visits []*Visit
	for resultsIterator.HasNext() {
		response, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		// Extract visitID from composite key
		_, compositeKeyParts, err := ctx.GetStub().SplitCompositeKey(response.Key)
		if err != nil {
			continue
		}
		visitID := compositeKeyParts[1]

		// Get actual visit data
		visitJSON, err := ctx.GetStub().GetState(visitID)
		if err != nil {
			continue
		}

		var visit Visit
		json.Unmarshal(visitJSON, &visit)
		visits = append(visits, &visit)
	}

	return visits, nil
}

// ===== REFERRAL MANAGEMENT FUNCTIONS =====

// CreateReferral creates a patient referral
func (s *BPJSSmartContract) CreateReferral(ctx contractapi.TransactionContextInterface,
	referralID string, patientID string, patientName string, cardID string,
	fromFaskesCode string, fromFaskesName string, toFaskesCode string, toFaskesName string,
	referralReason string, diagnosis string, referringDoctor string,
	referralDate string, validUntil string, notes string) error {

	// Verify card
	_, err := s.VerifyCard(ctx, cardID)
	if err != nil {
		return fmt.Errorf("card verification failed: %v", err)
	}

	creator, _ := ctx.GetClientIdentity().GetID()

	referral := Referral{
		ReferralID:      referralID,
		PatientID:       patientID,
		PatientName:     patientName,
		CardID:          cardID,
		FromFaskesCode:  fromFaskesCode,
		FromFaskesName:  fromFaskesName,
		ToFaskesCode:    toFaskesCode,
		ToFaskesName:    toFaskesName,
		ReferralReason:  referralReason,
		Diagnosis:       diagnosis,
		ReferringDoctor: referringDoctor,
		ReferralDate:    referralDate,
		ValidUntil:      validUntil,
		Status:          "pending",
		Notes:           notes,
		CreatedBy:       creator,
		Timestamp:       time.Now(),
	}

	referralJSON, _ := json.Marshal(referral)
	err = ctx.GetStub().PutState(referralID, referralJSON)
	if err != nil {
		return err
	}

	// Create index for querying
	indexKey, _ := ctx.GetStub().CreateCompositeKey("patientID~referralID", []string{patientID, referralID})
	ctx.GetStub().PutState(indexKey, []byte{0x00})

	ctx.GetStub().SetEvent("ReferralCreated", []byte(fmt.Sprintf("Referral %s created for %s", referralID, patientName)))

	return s.createAuditLog(ctx, "CreateReferral", "referral", referralID, creator, "FASKES_STAFF",
		fmt.Sprintf("Created referral from %s to %s", fromFaskesName, toFaskesName))
}

// UpdateReferralStatus updates referral status
func (s *BPJSSmartContract) UpdateReferralStatus(ctx contractapi.TransactionContextInterface,
	referralID string, newStatus string, acceptedBy string, notes string) error {

	referralJSON, err := ctx.GetStub().GetState(referralID)
	if err != nil || referralJSON == nil {
		return fmt.Errorf("referral %s not found", referralID)
	}

	var referral Referral
	json.Unmarshal(referralJSON, &referral)

	referral.Status = newStatus
	referral.AcceptedBy = acceptedBy
	referral.AcceptedDate = time.Now().Format("2006-01-02")
	referral.Notes = notes
	referral.Timestamp = time.Now()

	updatedJSON, _ := json.Marshal(referral)
	err = ctx.GetStub().PutState(referralID, updatedJSON)
	if err != nil {
		return err
	}

	actor, _ := ctx.GetClientIdentity().GetID()
	return s.createAuditLog(ctx, "UpdateReferralStatus", "referral", referralID, actor, "FASKES_STAFF",
		fmt.Sprintf("Referral status updated to %s", newStatus))
}

// ===== CLAIM PROCESSING FUNCTIONS =====

// SubmitClaim submits an insurance claim
func (s *BPJSSmartContract) SubmitClaim(ctx contractapi.TransactionContextInterface,
	claimID string, patientID string, patientName string, cardID string, visitID string,
	faskesCode string, faskesName string, claimType string, serviceDate string,
	diagnosis string, treatment string, totalAmount float64, claimAmount float64) error {

	// Verify card and visit exist
	_, err := s.VerifyCard(ctx, cardID)
	if err != nil {
		return fmt.Errorf("card verification failed: %v", err)
	}

	submitter, _ := ctx.GetClientIdentity().GetID()

	claim := Claim{
		ClaimID:     claimID,
		PatientID:   patientID,
		PatientName: patientName,
		CardID:      cardID,
		VisitID:     visitID,
		FaskesCode:  faskesCode,
		FaskesName:  faskesName,
		ClaimType:   claimType,
		ServiceDate: serviceDate,
		Diagnosis:   diagnosis,
		Treatment:   treatment,
		TotalAmount: totalAmount,
		ClaimAmount: claimAmount,
		Status:      "submitted",
		SubmittedBy: submitter,
		SubmitDate:  time.Now().Format("2006-01-02"),
		Timestamp:   time.Now(),
	}

	claimJSON, _ := json.Marshal(claim)
	err = ctx.GetStub().PutState(claimID, claimJSON)
	if err != nil {
		return err
	}

	// Create index
	indexKey, _ := ctx.GetStub().CreateCompositeKey("patientID~claimID", []string{patientID, claimID})
	ctx.GetStub().PutState(indexKey, []byte{0x00})

	ctx.GetStub().SetEvent("ClaimSubmitted", []byte(fmt.Sprintf("Claim %s submitted by %s", claimID, faskesName)))

	return s.createAuditLog(ctx, "SubmitClaim", "claim", claimID, submitter, "FASKES_STAFF",
		fmt.Sprintf("Submitted claim for %.2f", claimAmount))
}

// ProcessClaim processes claim approval/rejection
func (s *BPJSSmartContract) ProcessClaim(ctx contractapi.TransactionContextInterface,
	claimID string, newStatus string, reviewNotes string) error {

	claimJSON, err := ctx.GetStub().GetState(claimID)
	if err != nil || claimJSON == nil {
		return fmt.Errorf("claim %s not found", claimID)
	}

	var claim Claim
	json.Unmarshal(claimJSON, &claim)

	reviewer, _ := ctx.GetClientIdentity().GetID()

	claim.Status = newStatus
	claim.ReviewedBy = reviewer
	claim.ReviewDate = time.Now().Format("2006-01-02")
	claim.ReviewNotes = reviewNotes

	if newStatus == "approved" {
		claim.PaymentDate = time.Now().Add(7 * 24 * time.Hour).Format("2006-01-02") // Payment in 7 days
	}

	claim.Timestamp = time.Now()

	updatedJSON, _ := json.Marshal(claim)
	err = ctx.GetStub().PutState(claimID, updatedJSON)
	if err != nil {
		return err
	}

	ctx.GetStub().SetEvent("ClaimProcessed", []byte(fmt.Sprintf("Claim %s %s", claimID, newStatus)))

	return s.createAuditLog(ctx, "ProcessClaim", "claim", claimID, reviewer, "BPJS_REVIEWER",
		fmt.Sprintf("Claim %s. Notes: %s", newStatus, reviewNotes))
}

// GetPatientClaims retrieves all claims for a patient
func (s *BPJSSmartContract) GetPatientClaims(ctx contractapi.TransactionContextInterface,
	patientID string) ([]*Claim, error) {

	resultsIterator, err := ctx.GetStub().GetStateByPartialCompositeKey("patientID~claimID", []string{patientID})
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var claims []*Claim
	for resultsIterator.HasNext() {
		response, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		_, compositeKeyParts, err := ctx.GetStub().SplitCompositeKey(response.Key)
		if err != nil {
			continue
		}
		claimID := compositeKeyParts[1]

		claimJSON, err := ctx.GetStub().GetState(claimID)
		if err != nil {
			continue
		}

		var claim Claim
		json.Unmarshal(claimJSON, &claim)
		claims = append(claims, &claim)
	}

	return claims, nil
}

// ===== AUDIT FUNCTIONS =====

func (s *BPJSSmartContract) createAuditLog(ctx contractapi.TransactionContextInterface,
	action string, entityType string, entityID string, actorID string, actorRole string,
	description string) error {

	orgID, _ := ctx.GetClientIdentity().GetMSPID()
	logID := fmt.Sprintf("AUDIT_%d", time.Now().UnixNano())

	auditLog := AuditLog{
		LogID:       logID,
		Action:      action,
		EntityType:  entityType,
		EntityID:    entityID,
		ActorID:     actorID,
		ActorRole:   actorRole,
		OrgID:       orgID,
		Description: description,
		Timestamp:   time.Now(),
	}

	auditJSON, _ := json.Marshal(auditLog)
	return ctx.GetStub().PutState(logID, auditJSON)
}

// QueryAuditLogs retrieves audit logs (can be filtered)
func (s *BPJSSmartContract) QueryAuditLogs(ctx contractapi.TransactionContextInterface,
	startKey string, endKey string) ([]*AuditLog, error) {

	resultsIterator, err := ctx.GetStub().GetStateByRange(startKey, endKey)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var logs []*AuditLog
	for resultsIterator.HasNext() {
		response, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var log AuditLog
		json.Unmarshal(response.Value, &log)
		logs = append(logs, &log)
	}

	return logs, nil
}

// ===== MAIN =====

func main() {
	chaincode, err := contractapi.NewChaincode(&BPJSSmartContract{})
	if err != nil {
		log.Panicf("Error creating BPJS chaincode: %v", err)
	}

	if err := chaincode.Start(); err != nil {
		log.Panicf("Error starting BPJS chaincode: %v", err)
	}
}
