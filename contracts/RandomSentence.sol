pragma solidity ^0.4.11;

import "./oraclize/usingOraclize.sol";


contract RandomSentence is usingOraclize {

    uint private currentSentence = 0;

    bytes32[] private sentences = [
        bytes32("sends props to"),
        "says thanks you to",
        "is thankful to",
        "says thanks to",
        "props",
        "is grateful to"
    ];

    event Updated(bytes32 sentence);

    function () payable {}

    function mockOraclize(address resolverAddress) {
        OAR = OraclizeAddrResolverI(resolverAddress);
    }

    function update() payable {
        oraclize_query("WolframAlpha", queryContent());
    }

    function __callback(bytes32 _myId, string result) {
        if (msg.sender != oraclize_cbAddress())
            throw;
        currentSentence = parseInt(result);
        Updated(get());
    }

    // Constant functions (functions that do NOT write to blockchain)

    function get() constant returns (bytes32) {
        return sentences[currentSentence];
    }

    function maxSentence() private constant returns (string) {
        return uint2str(sentences.length - 1);
    }

    function queryContent() private constant returns (string) {
        return strConcat("random number between 0 and ", maxSentence());
    }
}
