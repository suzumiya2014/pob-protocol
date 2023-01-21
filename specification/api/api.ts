import { api, body, endpoint, request, response, headers, String } from "@airtasker/spot";

@api({
	name	: "Proof of Backhaul"
})
class Api {
}

////////////////////////////////////////////////////////////////////////////////

interface SuccessResponse {
	result : {
		 success : boolean;
	}
}

interface FailureResponse {
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
	bandwidth_claimed	: number; // make it camel case
}

interface PreloginResponse {
	result : {
		message : String;
	}
}

interface LoginRequest {
	message		: String;
	signature	: String;
}

////////////////////////////////////////////////////////////////////////////////

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

interface ChallengeStatusRequest {
	transaction	: String;
}

interface ChallengeStatusResponse {
	result : {
		 challenge_id			: String;
		 challenge_status		: String;
		 start_challenge_transaction	: String;
		 end_challenge_transaction	: String;
	}
}

////////////////////////////////////////////////////////////////////////////////

@endpoint({
	method	: "GET",
	path	: "/",
	tags	: ["Websocket for Heartbeat and Notifications"]
})
class ApiHeartbeat
{
	@request
	request(
		@headers headers : {
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
