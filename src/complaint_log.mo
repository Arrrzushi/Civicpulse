import Array "mo:base/Array";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Result "mo:base/Result";

actor ComplaintLog {
    type Complaint = {
        id: Nat;
        title: Text;
        description: Text;
        category: Text;
        location: Text;
        latitude: Text;
        longitude: Text;
        evidenceHash: Text;
        privacy: Text;
        urgency: Text;
        aiAnalysis: ?Text;
        submitter: Principal;
        timestamp: Int;
        status: Text;
        donations: Nat;
    };

    private stable var nextId: Nat = 0;
    private stable var complaints: [Complaint] = [];

    public shared(msg) func submitComplaint(
        title: Text,
        description: Text,
        category: Text,
        location: Text,
        latitude: Text,
        longitude: Text,
        evidenceHash: Text,
        privacy: Text,
        urgency: Text,
        aiAnalysis: ?Text
    ) : async Result.Result<Nat, Text> {
        let complaint: Complaint = {
            id = nextId;
            title = title;
            description = description;
            category = category;
            location = location;
            latitude = latitude;
            longitude = longitude;
            evidenceHash = evidenceHash;
            privacy = privacy;
            urgency = urgency;
            aiAnalysis = aiAnalysis;
            submitter = msg.caller;
            timestamp = Time.now();
            status = "pending";
            donations = 0;
        };

        complaints := Array.append(complaints, [complaint]);
        nextId += 1;
        #ok(nextId - 1)
    };

    public query func getComplaints() : async [Complaint] {
        complaints
    };

    public query func getComplaint(id: Nat) : async ?Complaint {
        if (id >= complaints.size()) {
            null
        } else {
            ?complaints[id]
        }
    };

    public shared(msg) func updateComplaintStatus(id: Nat, status: Text) : async Result.Result<(), Text> {
        if (id >= complaints.size()) {
            #err("Complaint not found")
        } else {
            let complaint = complaints[id];
            if (complaint.submitter != msg.caller) {
                #err("Not authorized")
            } else {
                let updatedComplaint = {
                    complaint with
                    status = status;
                };
                complaints := Array.tabulate(complaints.size(), func (i: Nat) : Complaint {
                    if (i == id) { updatedComplaint } else { complaints[i] }
                });
                #ok()
            }
        }
    };
}
