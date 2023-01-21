import {
	api,
	body,
	endpoint,
	request,
	response,
	headers,
	String,
	Float,
	DateTime
}
	from "@airtasker/spot";

@api({
	name	: "Proof of Backhaul"
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
	authFailureResponse(
		@body body: FailureResponse
	) {}
}

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
	role			: String;
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

@endpoint({
	method	: "POST",
	path	: "/api/prover",
	tags	: ["Prover Information"]
})
class ApiProver
{
	@response({ status: 200 })
	successfulResponse(
		@body body : ProverResponse 
	) {}

	@response({ status: 401 })
	authFailureResponse(
		@body body : FailureResponse
	) {}
}

interface Prover {
	id			: String;
	geoip			: String;
	last_alive		: DateTime;
	bandwidth_claimed	: Float;
	results			: ChallengeResult[];
}

interface ProverResponse {
	result : Prover
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

@endpoint({
	method	: "POST",
	path	: "/api/provers",
	tags	: ["Prover Information"]
})
class ApiProvers
{
	@response({ status: 200 })
	successfulResponse(
		@body body : ProversResponse[] 
	) {}

	@response({ status: 401 })
	authFailureResponse(
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
	authFailureResponse(
		@body body : FailureResponse
	) {}
}
