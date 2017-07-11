pragma solidity ^0.4.11;

import "./oraclize/usingOraclize.sol";


contract RandomSentence is usingOraclize {

    uint private currentSentence;

    bytes32[] private sentences = [
        bytes32("says thank you to"),
        "sends props to",
        "is thankful to",
        "says thanks",
        "props"
    ];

    function RandomSentence() {
        //OAR = OraclizeAddrResolverI(0x6f485C8BF6fc43eA212E93BBF8ce046C7f1cb475);
        // Uncomment and use proper address when using in development with oraclize ethereum-bridge
        update();
    }

    function () payable {}

    function update() payable {
        oraclize_query("WolframAlpha", queryContent());
    }

    function __callback(bytes32 _myId, string result) {
        if (msg.sender != oraclize_cbAddress())
            throw;
        currentSentence = parseInt(result);
    }

    // Constant functions (functions that do NOT write to blockchain)

    function get() constant returns (bytes32) {
        return sentences[currentSentence - 1];
    }

    function sentencesCount() private constant returns (string) {
        return uint2str(sentences.length);
    }

    function queryContent() private constant returns (string) {
        return strConcat("random number between 1 and ", sentencesCount());
    }
}
