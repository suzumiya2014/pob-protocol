import {
	api,
	body,
	endpoint,
	request,
	response,
	headers,
	String,
	Integer,
	Float,
	DateTime
}
	from "@airtasker/spot";

@api({
	name	: "Proof of Backhaul",
	version	: "1.0",
})
class Api {
}

////////////////////////////////////////////////////////////////////////////////

interface SuccessResponse {

	/** successful response has some result **/

	result : {
		 success : boolean;
	}
}

interface FailureResponse {

	/** on failure the message contains the reason for failure **/

	error : {
		 message : String;
	}
}

////////////////////////////////////////////////////////////////////////////////

/**
	-----

	This API is to be called before logging in.

	It will return a 'message' that has to be signed and sent to /login API.

	This will also create a cookie; hence must be called in a session.
**/

@endpoint({
	method	: "POST",
	path	: "/api/pre-login",
	tags	: ["Auth"]
})
class ApiPreLogin
{
	@request
	request(
		@body body: PreloginRequest
	) {}

	@response({ status: 200 })
	successfulResponse(
		@body body: PreloginResponse,
		@headers headers : {
			"Set-Cookie" : String
		}
	) {}

	@response({ status: 400 })
	badRequestResponse(
		@body body: FailureResponse
	) {}

	@response({ status: 401 })
	unauthorizedResponse(
		@body body: FailureResponse
	) {}
}

/**
	-----

	This API logs in the user. 

	It should send back the 'message' that was sent during /pre-login API; 

	and must sign the 'message' using private key

	and send it in the 'signature' field.	
**/


@endpoint({
	method	: "POST",
	path	: "/api/login",
	tags	: ["Auth"]
})
class ApiLogin
{
	@request
	request(
		@body body: LoginRequest,
		@headers headers : {
			"Cookie" : String
		}
	) {}

	@response({ status: 200 })
	successfulResponse(
		@body body: SuccessResponse
	) {}

	@response({ status: 400 })
	badRequestResponse(
		@body body: FailureResponse,
	) {}
}

/**
	-----

	Get logged in user information.
**/

@endpoint({
	method	: "POST",
	path	: "/api/user-info",
	tags	: ["Auth"]
})
class ApiUserInfo
{
	@request
	request(
		@headers headers : {
			"Cookie" : String
		}
	) {}

	@response({ status: 200 })
	successfulResponse(
		@body body: UserInfoResponse 
	) {}
}

interface UserInfoResponse {
	result : {
		/** will return 'null' if the user has not logged in **/
		publicKey : String | null;
	}
}

/**
	-----

	Logs out the user.
**/

@endpoint({
	method	: "POST",
	path	: "/api/logout",
	tags	: ["Auth"]
})
class ApiLogout
{
	@request
	request(
	) {}

	@response({ status: 200 })
	successfulResponse(
		@body body: SuccessResponse
	) {}
}

interface PreloginRequest {
	publicKey		: String;
	walletPublicKey?	: String;
	keyType			: String;
	role			: "prover" | "challenger" | "payer";
	projectName		: String;
	projectPublicKey	: String;
	bandwidth_claimed	: Float; // make it camel case
}

interface PreloginResponse {
	result : {

		/** to be signed and sent in '/login' API **/
		message : String;
	}
}

interface LoginRequest {

	/** the message received in /pre-login API **/
	message		: String;

	/** the signature afer signing the message with private key **/
	signature	: String;
}

////////////////////////////////////////////////////////////////////////////////

/**
	-----

	Get information about a prover.	
**/

@endpoint({
	method	: "POST",
	path	: "/api/prover",
	tags	: ["Prover Information"]
})
class ApiProver
{
	@request
	request(
		@headers headers : {
			"Cookie" : String
		}
	) {}

	@response({ status: 200 })
	successfulResponse(
		@body body : ProverResponse,
	) {}

	@response({ status: 401 })
	unauthorizedResponse(
		@body body : FailureResponse
	) {}
}

interface ProverDetails {
	id			: String;
	geoip			: String;
	last_alive		: DateTime;
	bandwidth_claimed	: Float;
	results			: ChallengeResult[];
}

interface ProverResponse {
	result : ProverDetails
}

interface ChallengeResult {
	result			: Result[],
	message			: String,
	signature		: String,
	challenger		: String,
	challenge_start_time	: DateTime,
}

interface Result {
	bandwidth	: Float,
	latency		: Float
}

/**
	-----

	Get information about all the provers. 
**/

@endpoint({
	method	: "POST",
	path	: "/api/provers",
	tags	: ["Prover Information"]
})
class ApiProvers
{
	@request
	request(
		@headers headers : {
			"Cookie" : String
		}
	) {}

	@response({ status: 200 })
	successfulResponse(
		@body body : ProversResponse[],
		@headers headers : {
			"Cookie" : String
		}
	) {}

	@response({ status: 401 })
	unauthorizedResponse(
		@body body : FailureResponse
	) {}
}

interface ProversResponse {
	result : {
		provers : String[];
	}
}
////////////////////////////////////////////////////////////////////////////////


interface ChallengeRequest {
	prover		: String;
	transaction	: String;
}

interface ChallengeResponse {
	result : {
		 challenge_id		: String;
		 challenge_status	: String;
	}
}


/**
	-----

	Request to create a new challenge.	

	Before calling this api 'startChallenge()' smart contract must be called.

	And the 'transaction' after calling the startChallenge must be provided.
**/

@endpoint({
	method	: "POST",
	path	: "/api/challenge-request",
	tags	: ["Challenge"]
})
class ApiChallengeRequest 
{
	@request
	request(
		@body body: ChallengeRequest,

		@headers headers : {
			"Cookie" : String
		}
	) {}

	@response({ status: 200 })
	successfulResponse(
		@body body: ChallengeResponse 
	) {}
}

/**
	-----

	Get the status of a given challenge.	
**/

@endpoint({
	method	: "POST",
	path	: "/api/challenge-status",
	tags	: ["Challenge"]
})
class ApiChallengeStatus
{
	@request
	request(
		@body body: ChallengeStatusRequest,

		@headers headers : {
			"Cookie" : String
		}
	) {}

	@response({ status: 200 })
	successfulResponse(
		@body body: ChallengeStatusResponse
	) {}
}

/**
	-----

	Post the results of a challenge.	
**/

@endpoint({
	method	: "POST",
	path	: "/api/challenge-result",
	tags	: ["Challenge"]
})
class ApiChallengeResult 
{
	@request
	request(
		@body body: ChallengeResultRequest,

		@headers headers : {
			"Cookie" : String
		}
	) {}

	@response({ status: 200 })
	successfulResponse(
		@body body: ChallengeResponse 
	) {}
}

interface ChallengeResultRequest {
	prover		: String;
	transaction	: String;
}

interface ChallengeStatusRequest {
	transaction : String;
}

interface ChallengeStatusResponse {
	result : {
		 challenge_id			: String;
		 challenge_status		: String;
		 start_challenge_transaction	: String;
		 end_challenge_transaction?	: String;
	}
}

////////////////////////////////////////////////////////////////////////////////

/**
	-----

	A websocket connection for:

		1. Sending heartbeat (websocket ping).
		2. Receiving notification regarding challenges.
**/

@endpoint({
	method	: "GET",
	path	: "/ws",
	tags	: ["Websocket for Heartbeat and Notifications"]
})
class ApiHeartbeat
{
	@request
	request(
		@headers headers : {

			/** this cookie should come from the result of /login API **/

			"Cookie" : String
		}
	) {}

	@response({ status: 101 })
		successfulResponse(
	) {}

	@response({ status: 401 })
	unauthorizedResponse(
		@body body : FailureResponse
	) {}
}

interface ChallengeInfoForProver
{
	message_type	: "challenge_for_prover",
	message		: {
		challenge_id			: String,
		challenge_start_time		: DateTime,
		challenge_timeout		: DateTime,
		challengers			: Challenger [], 
		max_packets_per_challenger	: Integer,
		total_num_packets_for_challenge : Integer
	},
	signature			: String
}

interface ChallengeInfoForChallenger
{
	message_type	: "challenge_for_challenger",
	message		: {
		challenge_id			: String,
		prover				: Prover, 
		challenge_start_time		: DateTime,
		challenge_timeout		: DateTime,
		num_packets			: Integer,
		rate_of_packets_mbps		: Float,
		total_num_packets_for_challenge : Integer,
	},
	signature			: String
}

interface Prover {
	ip		: String,
	publicKey	: String
}

interface Challenger {
	ip		: String,
	publicKey	: String
}
