// SPDX-License-Identifier: MIT


pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./IERC721.sol";
contract URIStorage is ERC721URIStorage{
    construct
    function setTokenURI(uint256 tokenId_) public pure returns (string memory) {
        string memory svgPart1 = '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="none"><rect width="600" height="400" rx="20" fill="white"/><rect x="0.5" y="0.5" width="599" height="399" rx="20" stroke="#F9F9F9"/><mask id="m_3525_1" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="300" y="0" width="300" height="400"><path d="M300 0H580C590 0 600 8 600 20V380C600 392 590 400 580 400H300V0Z" fill="white"/></mask><g mask="url(#m_3525_1)"><rect x="300" width="300" height="400" fill="#41928E"/>';
        string memory svgPart2 = '<svg x="234" y="50" width="600" height="600" viewBox="0 0 100 100" fill="#000000" stroke="#000000" stroke-width="0.00072"><title>helicopter</title><path d="M60.64,28.1a1.24,1.24,0,0,0-1.27-1.22l-14.89-.33c.61-.91,1.51-2.05,2.78-3.57,6.16-7.36,4.19-9.8,4.19-9.8s-2.28-2-9.91,3.84c-1.31,1-2.34,1.76-3.19,2.31l.3-14.09a1.19,1.19,0,1,0-2.38,0l-.34,15.33c-2,.44-3-1.25-7.33-3.31,0,0-2.34.91-2.86,2.77a39.41,39.41,0,0,1,3.39,6.24l-14.5-.31a1.2,1.2,0,1,0-.05,2.39l14.6.31a1.28,1.28,0,0,0,.35.59L19.84,41.61l-4.57-3.24.54-1.25S12,39.7,11.5,41.34l-.14,2,1.37-.48.41-1.31L16,45.91s-.79.9-.24,1.47,1.55-.1,1.55-.1l4.35,3.1-1.32.35-.54,1.35,2,0c1.65-.39,4.4-4.13,4.4-4.13l-1.28.49-3-4.71,12.81-9.15a1.31,1.31,0,0,0,1,.45l-.32,15a1.19,1.19,0,1,0,2.38,0L38,35.23a42.17,42.17,0,0,1,5.67,3.47c1.88-.44,2.87-2.75,2.87-2.75-1.71-4.1-3.24-5.34-3.09-7l15.87.34A1.25,1.25,0,0,0,60.64,28.1Z"/>';
        string memory svgPart3 = '</svg></g><text fill="#202020" font-family="Arial" font-size="12"><tspan x="26" y="41" font-size="16" font-weight="bold">CHECKNFT</tspan><tspan x="26" y="88" font-size="38" font-weight="bold">AMOUNT</tspan><tspan x="26" y="123" font-size="14" font-weight="bold" fill="#41328E">VMAN</tspan><tspan x="26" y="142">#tokenID</tspan><tspan x="26" y="280">TOKEN VALUE</tspan><tspan x="26" y="300">RECIEVED DATE</tspan><tspan x="250" y="280" text-anchor="end">000000</tspan><tspan x="250" y="300" text-anchor="end">dd/mm/yyyy</tspan><tspan x="26" y="344" font-size="7">Owner: 0x0000000000000000000000</tspan><tspan x="26" y="356" font-size="7">Updated on: dd/mm/yyyy</tspan><tspan x="20" y="380" font-size="7" fill="black" fill-opacity="0.6">Demo VMAN NFT </tspan></text></svg>';

        return string(abi.encodePacked(svgPart1, svgPart2, svgPart3));
    }
    function tokenURI(uint256 tokenId_) public view virtual override returns (string memory) {
            return setTokenURI(tokenId_);}
}

 function tokenURI(uint256 tokenId_) public view virtual override returns (string memory) {
            return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name": "VMANNFT #',
                                 tokenId_.toString(),
                                '", "description": "VMANNFT", "attributes": "", "image":"data:image/svg+xml;base64,',
                                Base64.encode(bytes(setTokenURI(tokenId_))),
                                '"}'
                            )
                        )
                    )
                )
            );}
              /*function setTokenURI(uint256 tokenId_) public view returns (string memory) {
    return string(
        abi.encodePacked(
            '<svg  xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none" >',
            '<g>',
            // Black background on the left half
            '<rect width="300" height="600" x="300"/>',
            // Solid green background on the right half
            '<image href="https://www.filterforge.com/more/help/images/size200.jpg"  width="300" height="600"/>',
            
            // Token details on the black background
            '<text xml:space="preserve" text-anchor="start" font-family="Noto Sans JP" font-size="24" id="svg_2" y="340" x="350" stroke-width="0" stroke="#000000" fill="#000000">Slot: ',
            slotOf(tokenId_).toString(),
            '</text>',
            '<text xml:space="preserve" text-anchor="start" font-family="Noto Sans JP" font-size="24" id="svg_3" y="410" x="350" stroke-width="0" stroke="#000000" fill="#000000">Balance: ',
            balanceOf(tokenId_).toString(),
            '</text>',
            '<text xml:space="preserve" text-anchor="start" font-family="Noto Sans JP" font-size="24" id="svg_3" y="270" x="350" stroke-width="0" stroke="#000000" fill="#000000">TokenId: ',
             tokenId_.toString(),
            '</text>',
            '<text xml:space="preserve" text-anchor="start" font-family="Noto Sans JP" font-size="24" id="svg_4" y="160" x="300" stroke-width="0" stroke="#000000" fill="#000000">CHECK NFT</text>',
            '</g></svg>'
        )
    );
}*/
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DateTimeConversion {
    function timestampToDate(uint256 timestamp) public pure returns (string memory) {
        uint256 _timestamp = timestamp;
        uint256 year;
        uint256 month;
        uint256 day;

        // Calculate year
        uint256 secondsInYear = 365 * 24 * 60 * 60;
        year = 1970 + (_timestamp / secondsInYear);
        uint256 secondsInLeapYear = 366 * 24 * 60 * 60;
        while (_timestamp >= secondsInLeapYear || (year % 4 == 0 && _timestamp >= secondsInYear)) {
            if (year % 4 == 0) {
                _timestamp -= secondsInLeapYear;
            } else {
                _timestamp -= secondsInYear;
            }
            year += 1;
        }

        // Calculate month and day
        uint256[] memory daysInMonth;
        if (year % 4 == 0) {
            daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        } else {
            daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        }
        uint256 monthSeconds;
        for (uint256 i = 0; i < daysInMonth.length; i++) {
            monthSeconds = daysInMonth[i] * 24 * 60 * 60;
            if (_timestamp < monthSeconds) {
                month = i + 1;
                day = _timestamp / (24 * 60 * 60) + 1;
                break;
            }
            _timestamp -= monthSeconds;
        }

        // Convert to string
        return string(abi.encodePacked(_uintToString(day), "/", _uintToString(month), "/", _uintToString(year)));
    }

    function _uintToString(uint256 num) internal pure returns (string memory) {
        if (num == 0) {
            return "00";
        }
        uint256 j = num;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length - 1;
        while (num != 0) {
            bstr[k--] = bytes1(uint8(48 + (num % 10)));
            num /= 10;
        }
        return string(bstr);
    }
}


}


    

