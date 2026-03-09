const axios = require('axios');

const params = {
  api_key: '695fa0d5e5cbac9238e60013',
  query: 'Minimalist',
  geo: 'IN',
  data_type: 'TIMESERIES'
};

axios.get('https://api.scrapingdog.com/google_trends', { params })
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error('Error:', error.message);
  });














{
  "interest_over_time": {
    "timerange_data": [],
    "timeline_data": [
      {
        "date": "Jan 5 – 11, 2025",
        "timestamp": "1736035200",
        "values": [
          {
            "query": "Minimalist",
            "value": 67,
            "extracted_value": "67"
          }
        ]
      },
      {
        "date": "Jan 12 – 18, 2025",
        "timestamp": "1736640000",
        "values": [
          {
            "query": "Minimalist",
            "value": 60,
            "extracted_value": "60"
          }
        ]
      },
      {
        "date": "Jan 19 – 25, 2025",
        "timestamp": "1737244800",
        "values": [
          {
            "query": "Minimalist",
            "value": 83,
            "extracted_value": "83"
          }
        ]
      },
      {
        "date": "Jan 26 – Feb 1, 2025",
        "timestamp": "1737849600",
        "values": [
          {
            "query": "Minimalist",
            "value": 67,
            "extracted_value": "67"
          }
        ]
      },
      {
        "date": "Feb 2 – 8, 2025",
        "timestamp": "1738454400",
        "values": [
          {
            "query": "Minimalist",
            "value": 73,
            "extracted_value": "73"
          }
        ]
      },
      {
        "date": "Feb 9 – 15, 2025",
        "timestamp": "1739059200",
        "values": [
          {
            "query": "Minimalist",
            "value": 70,
            "extracted_value": "70"
          }
        ]
      },
      {
        "date": "Feb 16 – 22, 2025",
        "timestamp": "1739664000",
        "values": [
          {
            "query": "Minimalist",
            "value": 65,
            "extracted_value": "65"
          }
        ]
      },
      {
        "date": "Feb 23 – Mar 1, 2025",
        "timestamp": "1740268800",
        "values": [
          {
            "query": "Minimalist",
            "value": 67,
            "extracted_value": "67"
          }
        ]
      },
      {
        "date": "Mar 2 – 8, 2025",
        "timestamp": "1740873600",
        "values": [
          {
            "query": "Minimalist",
            "value": 72,
            "extracted_value": "72"
          }
        ]
      },
      {
        "date": "Mar 9 – 15, 2025",
        "timestamp": "1741478400",
        "values": [
          {
            "query": "Minimalist",
            "value": 72,
            "extracted_value": "72"
          }
        ]
      },
      {
        "date": "Mar 16 – 22, 2025",
        "timestamp": "1742083200",
        "values": [
          {
            "query": "Minimalist",
            "value": 71,
            "extracted_value": "71"
          }
        ]
      },
      {
        "date": "Mar 23 – 29, 2025",
        "timestamp": "1742688000",
        "values": [
          {
            "query": "Minimalist",
            "value": 62,
            "extracted_value": "62"
          }
        ]
      },
      {
        "date": "Mar 30 – Apr 5, 2025",
        "timestamp": "1743292800",
        "values": [
          {
            "query": "Minimalist",
            "value": 64,
            "extracted_value": "64"
          }
        ]
      },
      {
        "date": "Apr 6 – 12, 2025",
        "timestamp": "1743897600",
        "values": [
          {
            "query": "Minimalist",
            "value": 64,
            "extracted_value": "64"
          }
        ]
      },
      {
        "date": "Apr 13 – 19, 2025",
        "timestamp": "1744502400",
        "values": [
          {
            "query": "Minimalist",
            "value": 67,
            "extracted_value": "67"
          }
        ]
      },
      {
        "date": "Apr 20 – 26, 2025",
        "timestamp": "1745107200",
        "values": [
          {
            "query": "Minimalist",
            "value": 61,
            "extracted_value": "61"
          }
        ]
      },
      {
        "date": "Apr 27 – May 3, 2025",
        "timestamp": "1745712000",
        "values": [
          {
            "query": "Minimalist",
            "value": 61,
            "extracted_value": "61"
          }
        ]
      },
      {
        "date": "May 4 – 10, 2025",
        "timestamp": "1746316800",
        "values": [
          {
            "query": "Minimalist",
            "value": 58,
            "extracted_value": "58"
          }
        ]
      },
      {
        "date": "May 11 – 17, 2025",
        "timestamp": "1746921600",
        "values": [
          {
            "query": "Minimalist",
            "value": 61,
            "extracted_value": "61"
          }
        ]
      },
      {
        "date": "May 18 – 24, 2025",
        "timestamp": "1747526400",
        "values": [
          {
            "query": "Minimalist",
            "value": 58,
            "extracted_value": "58"
          }
        ]
      },
      {
        "date": "May 25 – 31, 2025",
        "timestamp": "1748131200",
        "values": [
          {
            "query": "Minimalist",
            "value": 58,
            "extracted_value": "58"
          }
        ]
      },
      {
        "date": "Jun 1 – 7, 2025",
        "timestamp": "1748736000",
        "values": [
          {
            "query": "Minimalist",
            "value": 63,
            "extracted_value": "63"
          }
        ]
      },
      {
        "date": "Jun 8 – 14, 2025",
        "timestamp": "1749340800",
        "values": [
          {
            "query": "Minimalist",
            "value": 65,
            "extracted_value": "65"
          }
        ]
      },
      {
        "date": "Jun 15 – 21, 2025",
        "timestamp": "1749945600",
        "values": [
          {
            "query": "Minimalist",
            "value": 64,
            "extracted_value": "64"
          }
        ]
      },
      {
        "date": "Jun 22 – 28, 2025",
        "timestamp": "1750550400",
        "values": [
          {
            "query": "Minimalist",
            "value": 62,
            "extracted_value": "62"
          }
        ]
      },
      {
        "date": "Jun 29 – Jul 5, 2025",
        "timestamp": "1751155200",
        "values": [
          {
            "query": "Minimalist",
            "value": 65,
            "extracted_value": "65"
          }
        ]
      },
      {
        "date": "Jul 6 – 12, 2025",
        "timestamp": "1751760000",
        "values": [
          {
            "query": "Minimalist",
            "value": 63,
            "extracted_value": "63"
          }
        ]
      },
      {
        "date": "Jul 13 – 19, 2025",
        "timestamp": "1752364800",
        "values": [
          {
            "query": "Minimalist",
            "value": 69,
            "extracted_value": "69"
          }
        ]
      },
      {
        "date": "Jul 20 – 26, 2025",
        "timestamp": "1752969600",
        "values": [
          {
            "query": "Minimalist",
            "value": 73,
            "extracted_value": "73"
          }
        ]
      },
      {
        "date": "Jul 27 – Aug 2, 2025",
        "timestamp": "1753574400",
        "values": [
          {
            "query": "Minimalist",
            "value": 64,
            "extracted_value": "64"
          }
        ]
      },
      {
        "date": "Aug 3 – 9, 2025",
        "timestamp": "1754179200",
        "values": [
          {
            "query": "Minimalist",
            "value": 69,
            "extracted_value": "69"
          }
        ]
      },
      {
        "date": "Aug 10 – 16, 2025",
        "timestamp": "1754784000",
        "values": [
          {
            "query": "Minimalist",
            "value": 69,
            "extracted_value": "69"
          }
        ]
      },
      {
        "date": "Aug 17 – 23, 2025",
        "timestamp": "1755388800",
        "values": [
          {
            "query": "Minimalist",
            "value": 73,
            "extracted_value": "73"
          }
        ]
      },
      {
        "date": "Aug 24 – 30, 2025",
        "timestamp": "1755993600",
        "values": [
          {
            "query": "Minimalist",
            "value": 72,
            "extracted_value": "72"
          }
        ]
      },
      {
        "date": "Aug 31 – Sep 6, 2025",
        "timestamp": "1756598400",
        "values": [
          {
            "query": "Minimalist",
            "value": 68,
            "extracted_value": "68"
          }
        ]
      },
      {
        "date": "Sep 7 – 13, 2025",
        "timestamp": "1757203200",
        "values": [
          {
            "query": "Minimalist",
            "value": 65,
            "extracted_value": "65"
          }
        ]
      },
      {
        "date": "Sep 14 – 20, 2025",
        "timestamp": "1757808000",
        "values": [
          {
            "query": "Minimalist",
            "value": 100,
            "extracted_value": "100"
          }
        ]
      },
      {
        "date": "Sep 21 – 27, 2025",
        "timestamp": "1758412800",
        "values": [
          {
            "query": "Minimalist",
            "value": 62,
            "extracted_value": "62"
          }
        ]
      },
      {
        "date": "Sep 28 – Oct 4, 2025",
        "timestamp": "1759017600",
        "values": [
          {
            "query": "Minimalist",
            "value": 61,
            "extracted_value": "61"
          }
        ]
      },
      {
        "date": "Oct 5 – 11, 2025",
        "timestamp": "1759622400",
        "values": [
          {
            "query": "Minimalist",
            "value": 71,
            "extracted_value": "71"
          }
        ]
      },
      {
        "date": "Oct 12 – 18, 2025",
        "timestamp": "1760227200",
        "values": [
          {
            "query": "Minimalist",
            "value": 65,
            "extracted_value": "65"
          }
        ]
      },
      {
        "date": "Oct 19 – 25, 2025",
        "timestamp": "1760832000",
        "values": [
          {
            "query": "Minimalist",
            "value": 68,
            "extracted_value": "68"
          }
        ]
      },
      {
        "date": "Oct 26 – Nov 1, 2025",
        "timestamp": "1761436800",
        "values": [
          {
            "query": "Minimalist",
            "value": 80,
            "extracted_value": "80"
          }
        ]
      },
      {
        "date": "Nov 2 – 8, 2025",
        "timestamp": "1762041600",
        "values": [
          {
            "query": "Minimalist",
            "value": 81,
            "extracted_value": "81"
          }
        ]
      },
      {
        "date": "Nov 9 – 15, 2025",
        "timestamp": "1762646400",
        "values": [
          {
            "query": "Minimalist",
            "value": 85,
            "extracted_value": "85"
          }
        ]
      },
      {
        "date": "Nov 16 – 22, 2025",
        "timestamp": "1763251200",
        "values": [
          {
            "query": "Minimalist",
            "value": 91,
            "extracted_value": "91"
          }
        ]
      },
      {
        "date": "Nov 23 – 29, 2025",
        "timestamp": "1763856000",
        "values": [
          {
            "query": "Minimalist",
            "value": 87,
            "extracted_value": "87"
          }
        ]
      },
      {
        "date": "Nov 30 – Dec 6, 2025",
        "timestamp": "1764460800",
        "values": [
          {
            "query": "Minimalist",
            "value": 86,
            "extracted_value": "86"
          }
        ]
      },
      {
        "date": "Dec 7 – 13, 2025",
        "timestamp": "1765065600",
        "values": [
          {
            "query": "Minimalist",
            "value": 86,
            "extracted_value": "86"
          }
        ]
      },
      {
        "date": "Dec 14 – 20, 2025",
        "timestamp": "1765670400",
        "values": [
          {
            "query": "Minimalist",
            "value": 78,
            "extracted_value": "78"
          }
        ]
      },
      {
        "date": "Dec 21 – 27, 2025",
        "timestamp": "1766275200",
        "values": [
          {
            "query": "Minimalist",
            "value": 83,
            "extracted_value": "83"
          }
        ]
      },
      {
        "date": "Dec 28, 2025 – Jan 3, 2026",
        "timestamp": "1766880000",
        "values": [
          {
            "query": "Minimalist",
            "value": 75,
            "extracted_value": "75"
          }
        ]
      },
      {
        "date": "Jan 4 – 10, 2026",
        "timestamp": "1767484800",
        "values": [
          {
            "query": "Minimalist",
            "value": 96,
            "extracted_value": "96"
          }
        ]
      }
    ]
  }
}