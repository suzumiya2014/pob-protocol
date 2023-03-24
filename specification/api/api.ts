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
	DateTime,
	securityHeader,
}
	from "@airtasker/spot";

import {oa3server} from "@airtasker/spot/build/lib/src/syntax/oa3server";
import {oa3serverVariables} from "@airtasker/spot/build/lib/src/syntax/oa3serverVariables";

import {SecurityDefinitionsObject} from "@airtasker/spot/build/lib/src/generators/openapi2/openapi2-specification";
import {CookieParameterObject} from "@airtasker/spot/build/lib/src/generators/openapi3/openapi3-specification";

@api({
	name	: "Proof of Backhaul",
	version	: "1.0",
})
class Api {
	@oa3server({ url: "https://pob.witnesschain.com/{basePath}" })

	productionServer(
		@oa3serverVariables variables: {
			/**
			* @default "api"
			*/
			basePath: "api",
		}
	) {};


	@securityHeader
		"Cookie" : String;

/*
	Not sure how to specify exat cookie name 

	@securityHeader
		@CookieParameterObject (
		){
			in : "cookie"
		};

	@securityHeader
		ApiKeySecuritySchemeObject(
			"type" : "apiKey";
		){};

	@securityHeader // "Cookie" : String;
		SecurityDefinitionsObject (
		){
			"type"	: "apiKey",
			"name"	: "x",
			"in"	: "cookie",
		};
*/
}

////////////////////////////////////////////////////////////////////////////////

interface SuccessResponse {

	/** -----
	Successful response always has a valid 'result'.
	**/

	result : {
		 success : boolean;
	}
}

interface FailureResponse {

	/** -----
	On failure, the 'error.message' contains the reason for the failure.
	**/

	error : {
		 message : String;
	}
}

interface PreLoginCookieHeader {
		
	/** -----
	The cookie that was received after calling '/pre-login' API
	**/

	"Cookie" : String
}

interface LoginCookieHeader {
		
	/** -----
	The cookie that was received after calling '/login' API
	**/

	"Cookie" : String
} 

////////////////////////////////////////////////////////////////////////////////

/**
	-----

	This API is to be called before logging in.

	It will return a 'message' that has to be signed and sent to '/login' API.

	This will also create a cookie;

	hence the '/login' API must be called in a session.
**/

@endpoint({
	method	: "POST",
	path	: "/pre-login",
	tags	: ["Session"],
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

			/** initial cookie that is to be sent to '/login' API **/

			"Set-Cookie" : String
		}
	) {}

	@response({ status: 400 })
	badRequestResponse(
		@body body : FailureResponse
	) {}
}

interface PreloginRequest {
	/**
	-----
	The key used for login
	**/

	publicKey		: String;

	/**
	-----
	The wallet where all the rewards go.

	if 'walletPublicKey' is NOT provided, then:
		walletPublicKey = publicKey

	As of now these are supported wallets:
		1. solana
	**/

	walletPublicKey?	: String;

	/**
	-----
	The key-type of publicKey.

	As of now these are supported keyTypes:
		1. solana
	**/
	keyType			: "solana";

	/**
	-----
 	The role the user intends to play after login:

		1. prover
			User who wants to prove what it offers to the network.

			Example: 'bandwidth', 'latency', 'disk', 'cpu' etc.

		2. challenger
			User who wants to challenge a 'prover'
			and earn rewards.

		3. payer
			An abstract entity/user who pays
			and requests for a challenge.

			A payer could be:
			the 'prover' itself, other users, or the blockchain.
	**/

	role			: "prover" | "challenger" | "payer";

	/**
	-----
	If the user is also part of another blockchain project/app,

	then the project-name/app-name can be provided here.

		e.g. "filecoin", "filecoin-station", "oort", etc.
	**/

	projectName?		: String;

	/**
	-----
	publicKey of the user associated with the

	'projectName' blockchain project/app.
	**/

	projectPublicKey?	: String;

	/**
	-----
	The amount of bandwidth in Mbps the user has
		OR
	wants to claim.
	**/

	bandwidth_claimed	: Float;	// make it camel case
}

interface PreloginResponse {
	result : {

	/**
	-----
	A string to be signed using user's 'privateKey' to create a 'signature'.

	This 'signature' should be later sent in the '/login' API to login.
	**/
		message : String;
	}
}

/**
	-----

	This API logs in the user.

	The user should send the 'message' that was received during the '/pre-login';

	and must sign the 'message' using privateKey.

	And send it in the 'signature' field.
**/


@endpoint({
	method	: "POST",
	path	: "/login",
	tags	: ["Session"]
})
class ApiLogin
{
	@request
	request(
		@body		body	: LoginRequest,
		@headers	headers	: PreLoginCookieHeader 
	) {}

	@response({ status: 200 })
	successfulResponse(
		@body
			body: SuccessResponse,
		@headers
			headers : {

			/**
				Cookie after successful login.
				It must be presented for next API calls.
			**/

			"Set-Cookie" : String
		}
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
	path	: "/user-info",
	tags	: ["General Information"]
})
class ApiUserInfo
{
	@request
	request(
		@headers headers : LoginCookieHeader
	) {}

	@response({ status: 200 })
	successfulResponse(
		@body body: UserInfoResponse
	) {}
}

interface UserInfoResponse {
	result : {
	/**
	-----

	will return 'null' if the user has not logged in
	**/
		publicKey : String | null;
	}
}

	/**
	-----

	Logs out the user.
	**/

@endpoint({
	method	: "POST",
	path	: "/logout",
	tags	: ["Session"]
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


interface LoginRequest {

	/**
	-----
	The 'message' received in the '/pre-login' API.
	**/
	message		: String;

	/**
	-----
	The signature afer signing the 'message' with the 'privateKey'.
	**/
	signature	: String;
}

////////////////////////////////////////////////////////////////////////////////

	/**
	-----

	Get information about a prover.
	**/

@endpoint({
	method	: "POST",
	path	: "/prover",
	tags	: ["Prover Information"]
})
class ApiProver
{
	@request
	request(
		@body		body	: ProverRequest,
		@headers	headers : LoginCookieHeader
	) {}

	@response({ status: 200 })
	successfulResponse(
		@body body : ProverResponse,
	) {}

	@response({ status: 400 })
	badRequestResponse(
		@body body: FailureResponse
	) {}

	@response({ status: 401 })
	unauthorizedResponse(
		@body body : FailureResponse
	) {}
}

interface ProverDetails {
	/**
	-----
	The unique 'id' of the prover.
	**/
	id			: String;

	/**
	-----
	The estimate of geographic information based on IP address, please refer:
		https://www.npmjs.com/package/fast-geoip	
	**/
	geoip			: GeoIP;

	/**
	-----
	The latest time when the API server received a handshake from the prover.
	**/
	last_alive		: DateTime;

	/**
	-----
The amount of bandwidth in Mbps the user has
	OR
wants to claim.
	**/


	bandwidth_claimed	: Float;

	/**
	-----
 	The history of challenge results the proved has participated in.
	**/

	results			: ChallengeResult[];
}


interface GeoIP {
	range	: Integer[];	// [ 3479298048, 3479300095 ],
	country	: String;	// 'US',
	region  : String;	// 'TX',
	eu	: "0" | "1";	//
	timezone: String;	// 'America/Chicago',
	city	: String;	// 'San Antonio',
	ll	: Float[];	// [ 29.4969, -98.4032 ],
	metro	: Integer;	// 641,
	area	: Integer;	// 1000
}


interface ProverRequest {
	/**
	-----
 	The 'id' of the prover.
	**/
	prover : String;
}

interface ProverResponse {
	/**
	-----
 	The details of the prover. 
	**/
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
	/**
	-----
	Bandwidth measured by the challenger.
	**/

	bandwidth	: Float,

	/**
	-----
	Latency measured by the challenger.
	**/

	latency		: Float
}

	/**
	-----
	Get all provers info.
	**/

@endpoint({
	method	: "POST",
	path	: "/provers",
	tags	: ["Prover Information"]
})
class ApiProvers
{
	@request
	request(
		@headers headers : LoginCookieHeader
	) {}

	@response({ status: 200 })
	successfulResponse(
		@body body : ProversResponse[],
	) {}

	@response({ status: 401 })
	unauthorizedResponse(
		@body body : FailureResponse
	) {}
}

interface ProversResponse {
	result : {
		provers : ProverDetails[];
	}
}

////////////////////////////////////////////////////////////////////////////////


interface ChallengeRequest {

	/**
	-----
 	The 'id' of the prover.
	**/
	prover		: String;

	/**
	-----
 	The transaction that was generated after calling the
	'startChallenge' smart contract. 
	**/

	transaction	: String;
}

interface ChallengeResponse {
	result : {
		
		challenge_id     : String;
		challenge_status :
				"SUBMITTED_TO_CHALLENGE_COORDINATOR"	|
				"ACCEPTED_BY_CHALLENGE_COORDINATOR"	|
				"ERROR_NOT_ENOUGH_CHALLENGERS"		|
				"ENDED_SUCCESSFULLY";
	}
}


	/**
	-----

	Request to create a new challenge.

	Before calling this api 'startChallenge()' smart contract must be called.

	And the 'transaction' after calling the 'startChallenge' must be provided.
	**/

@endpoint({
	method	: "POST",
	path	: "/pob-challenge-request",
	tags	: ["PoB Challenge"]
})
class ApiChallengeRequest
{
	@request
	request(
		@body body: ChallengeRequest,

		@headers headers : LoginCookieHeader
	) {}

	@response({ status: 200 })
	successfulResponse(
		@body body: ChallengeResponse
	) {}

	@response({ status: 400 })
	badRequestResponse(
		@body body: FailureResponse
	) {}

	@response({ status: 401 })
	unauthorizedResponse(
		@body body : FailureResponse
	) {}
}

	/**
	-----
	Get the status of a given challenge.
	**/

@endpoint({
	method	: "POST",
	path	: "/pob-challenge-status",
	tags	: ["PoB Challenge"]
})
class ApiChallengeStatus
{
	@request
	request(
		@body body: ChallengeStatusRequest,
		@headers headers : LoginCookieHeader
	) {}

	@response({ status: 200 })
	successfulResponse(
		@body body: ChallengeStatusResponse
	) {}

	@response({ status: 400 })
	badRequestResponse(
		@body body: FailureResponse
	) {}

	@response({ status: 401 })
	unauthorizedResponse(
		@body body : FailureResponse
	) {}
}

	/**
	-----
	Post the results of a challenge.
	**/

@endpoint({
	method	: "POST",
	path	: "/pob-challenge-result",
	tags	: ["PoB Challenge"]
})
class ApiChallengeResult
{
	@request
	request(
		@body body: ChallengeResultRequest,
		@headers headers : LoginCookieHeader
	) {}

	@response({ status: 200 })
	successfulResponse(
		@body body: SuccessResponse 
	) {}

	@response({ status: 400 })
	badRequestResponse(
		@body body: FailureResponse
	) {}

	@response({ status: 401 })
	unauthorizedResponse(
		@body body : FailureResponse
	) {}
}

interface ChallengeResultRequest {  // XXX to be fixed
	message_type	: "challenge_result";

	/**
	-----
	The result of a challenge - a JSON converted to a string.

	e.g. in JavaScript:

		message = JSON.stringify ({
			challenge_id,
			result,
		});
	
	The result contains fields that have been measured

	by the challenger:

		like "bandwidth" and "latency".
	**/

	message		: String;

	/**
	-----
	The 'message' string signed using privateKey.
	**/

	signature	: String;
}

interface ChallengeStatusRequest {
	/**
	-----
 	The transaction that was generated after calling the
	'startChallenge' smart contract. 
	**/

	transaction : String;
}

interface ChallengeStatusResponse {
	result : {
		 challenge_id			: String;
		 start_challenge_transaction	: String;
		 end_challenge_transaction?	: String;
                 challenge_status		:
				"SUBMITTED_TO_CHALLENGE_COORDINATOR"	|
				"ACCEPTED_BY_CHALLENGE_COORDINATOR"	|
				"ERROR_NOT_ENOUGH_CHALLENGERS"		|
				"ENDED_SUCCESSFULLY";

	}
}

////////////////////////////////////////////////////////////////////////////////

	/**
	-----
	Claim that you have certain bandwidth in Mbps.
	**/


@endpoint({
	method	: "POST",
	path	: "/claim-bandwidth",
	tags	: ["PoB claim"]
})
class ApiClaimBandwidth 
{
	@request
	request(
		@body body : {
	/**
	-----
	The amount of bandwidth in Mbps the user has
		OR
	wants to claim.
	**/


			bandwidth_claimed : Float 
		},
		@headers	headers : LoginCookieHeader
	) {}

	@response({ status: 200 })
	successfulResponse(
		@body body : SuccessResponse 
	) {}

	@response({ status: 400 })
	badRequestResponse(
		@body body : FailureResponse
	) {}

	@response({ status: 401 })
	unauthorizedResponse(
		@body body : FailureResponse
	) {}
};


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
		@headers headers : LoginCookieHeader
	) {}

	/**
	-----

	This opens up a websocket connection.

	This response is the successful response.
	**/

	@response({ status: 101 })
	successfulResponse(
		@headers headers : {
			"Upgrade"	: "websocket",
			"Connection"	: "Upgrade"
		}
	) {}

	@response({ status: 401 })
	unauthorizedResponse(
		@body body : FailureResponse
	) {}

	/**
	-----

	This message is sent to a 'prover' through websocket when a challenge

	has been scheduled

	// ignore the status code '201' given here.
	**/

	@response({ status: 201 })
	wsResponseForProver(
		@body body : ChallengeInfoForProver
	) {}

	/**
	-----

	This message is sent to a 'challenger' through websocket when a challenge

	has been scheduled

	// ignore the status code '202' given here.
	**/

	@response({ status: 202 })
	wsResponseForChallenger(
		@body body : ChallengeInfoForChallenger
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
	signature				: String
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
	signature				: String
}

interface Prover {
	ip		: String,
	publicKey	: String
}

interface Challenger {
	ip		: String,
	publicKey	: String
}

/**
	-----

	Get user's IP addresses as seen by the challenge co-ordinator 
**/

@endpoint({
	method	: "POST",
	path	: "/ip-info",
	tags	: ["General Information"]
})
class ApiIPInfo
{
	@request
	request(
		@headers headers : LoginCookieHeader
	) {}

	@response({ status: 200 })
	successfulResponse(
		@body body: IPInfoResponse
	) {}
}

interface IPInfoResponse {
	result : {
	/**
	-----

	will return 'null' if the specific IP version is not available 
	**/
		IPv4 : String | null;
		IPv6 : String | null;
	}
}

/**
	-----

	Get statistics on 'provers' and 'challengers'. 
**/

@endpoint({
	method	: "POST",
	path	: "/statistics",
	tags	: ["General Information"]
})
class ApiStatistics
{
	@request
	request(
		@headers headers : LoginCookieHeader
	) {}

	@response({ status: 200 })
	successfulResponse(
		@body body: StatisticsResponse
	) {}
}

interface StatisticsResponse {
	result : {

	/**
	-----
	'online_provers' are the number of provers currently online.
	'num_provers'    are the total number of provers registered.
	**/
		online_provers		: Integer;
		num_provers		: Integer;

	/**
	-----
	'online_challenges' are the number of challengers currently online.
	'num_challengers'   are the total number of challengers registered.
	**/
		online_challenges	: Integer;
		num_challengers		: Integer;
	}
}
