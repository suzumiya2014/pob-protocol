import { api, body, endpoint, request, response, String } from "@airtasker/spot";

@api({
	name	: "Proof of Backhaul" 
})
class Api {
}

@endpoint({
	method	: "POST",
	path	: "/pre-login"
})
class PreLogin 
{
	@request
	request(
		@body body: PreloginRequest 
	) {}

	@response({ status: 200 })
	successfulResponse(
		@body body: PreloginResponse 
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
	path	: "/login"
})
class Login 
{
	@request
	request(
		@body body: LoginRequest 
	) {}

	@response({ status: 200 })
	successfulResponse(
		@body body: SuccessResponse 
	) {}

	@response({ status: 400 })
	badRequestResponse(
		@body body: FailureResponse 
	) {}
}

@endpoint({
	method	: "POST",
	path	: "/logout"
})
class Logout
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
	walletPublicKey		: String;		
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
