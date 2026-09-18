/**
 * Curated Cambridge O-Level / IGCSE / A-Level Topic-Specific Study Materials
 * Contains topic-specific flashcards and comprehensive cheatsheets
 * for Mathematics, ICT, Computer Science, Physics, Chemistry, Biology,
 * Accounting, Economics, Business Studies, English, Pakistan Studies, Islamiyat, and Urdu.
 */

export interface TopicFlashcard {
  id: string;
  q: string;
  a: string;
  hint?: string;
}

export interface TopicCheatsheet {
  key_formulae: string[];
  exam_rules: string[];
  common_pitfalls: string[];
  examiner_tips?: string[];
}

export interface TopicStudyMaterial {
  subjectMatch: string; // partial or exact lowercase match
  topicMatch?: string; // keywords to match in unit or lesson title
  flashcards: TopicFlashcard[];
  cheatsheet: TopicCheatsheet;
}

export const CURATED_TOPIC_MATERIALS: TopicStudyMaterial[] = [
  // =========================================================================
  // ICT / COMPUTER SCIENCE — BINARY & DENARY CONVERSION (LESSONS 0 & 2)
  // =========================================================================
  {
    subjectMatch: 'ict|computer',
    topicMatch: 'binary to denary|denary to binary|denary|binary conversion|base-2',
    flashcards: [
      {
        id: 'ict-bin-den-1',
        q: 'How do you convert an 8-bit binary number (e.g. 01011100) to denary?',
        a: 'Write the 8-bit place values (128, 64, 32, 16, 8, 4, 2, 1) above each bit, then sum the values where the bit is 1:\n64 + 16 + 8 + 4 = 92 (denary).'
      },
      {
        id: 'ict-bin-den-2',
        q: 'How do you convert a denary number (e.g. 53) to an 8-bit binary number?',
        a: 'Compare against descending powers of 2 (128, 64, 32, 16, 8, 4, 2, 1):\n• 53 < 128 → 0\n• 53 < 64 → 0\n• 53 ≥ 32 → 1 (rem 21)\n• 21 ≥ 16 → 1 (rem 5)\n• 5 < 8 → 0\n• 5 ≥ 4 → 1 (rem 1)\n• 1 < 2 → 0\n• 1 ≥ 1 → 1 (rem 0)\nResult: 00110101.'
      },
      {
        id: 'ict-bin-den-3',
        q: 'What is the difference between a bit, a nibble, and a byte?',
        a: '• Bit: A single binary digit (0 or 1).\n• Nibble: A group of 4 bits (e.g. 1010, maximum value 15).\n• Byte: A group of 8 bits (e.g. 10110100, maximum value 255).'
      },
      {
        id: 'ict-bin-den-4',
        q: 'Why do computer systems use the binary number system rather than denary?',
        a: 'Computer logic gates and transistors operate using two stable electrical voltage states: ON (high voltage, 1) and OFF (low voltage, 0). Binary is reliable, simple, and resistant to electrical noise.'
      },
      {
        id: 'ict-bin-den-5',
        q: 'What is the formula for the maximum denary number that can be stored in n bits?',
        a: 'Max Value = 2ⁿ - 1. For an 8-bit byte, 2⁸ - 1 = 255. An 8-bit byte can represent 256 unique combinations (0 through 255).'
      }
    ],
    cheatsheet: {
      key_formulae: [
        '8-Bit Place Values: 128 | 64 | 32 | 16 | 8 | 4 | 2 | 1',
        'Denary to Binary: Successive subtraction of highest powers of 2, or repeated division by 2 recording remainders',
        'Range of n-bit unsigned integer: 0 to 2ⁿ - 1 (8 bits = 0 to 255)',
        'Total distinct values with n bits = 2ⁿ (8 bits = 256 unique values)',
        '1 Byte = 8 bits; 1 Nibble = 4 bits; 1 KiB = 1,024 Bytes'
      ],
      exam_rules: [
        'Always write full 8-bit bytes (add leading zeros if number is < 8 bits, e.g. 00110101, not just 110101).',
        'In conversion questions, show the place-value headings (128 to 1) at the top of your working table to secure Method marks.',
        'Distinguish clearly between bits (lowercase b) and Bytes (capital B).'
      ],
      common_pitfalls: [
        'Writing fewer than 8 bits when asked to give an answer as an 8-bit binary register.',
        'Calculation error when summing multiple place values (e.g. 128 + 64 + 32).'
      ],
      examiner_tips: [
        'Cambridge mark schemes award M1 for listing the correct place value weights and A1 for the correct binary or denary result.'
      ]
    }
  },

  // =========================================================================
  // ICT / COMPUTER SCIENCE — HEXADECIMAL & NUMBER SYSTEMS
  // =========================================================================
  {
    subjectMatch: 'ict|computer',
    topicMatch: 'hexadecimal|hex to binary|binary to hex|uses of hex|number systems',
    flashcards: [
      {
        id: 'ict-hex-1',
        q: 'Why is hexadecimal used in computer science instead of binary?',
        a: 'Hexadecimal is much shorter and more human-readable than binary (1 hex digit = 4 binary bits), reducing transcription errors when humans work with MAC addresses, memory dumps, and HTML colour codes.'
      },
      {
        id: 'ict-hex-2',
        q: 'How do you convert an 8-bit binary number (e.g. 11011010) to hexadecimal?',
        a: 'Split the 8 bits into two 4-bit nibbles:\n• High nibble: 1101 = 8 + 4 + 1 = 13 → D\n• Low nibble: 1010 = 8 + 2 = 10 → A\nResult: DA (hexadecimal).'
      },
      {
        id: 'ict-hex-3',
        q: 'What are the hexadecimal digits representing values 10 through 15?',
        a: 'A = 10, B = 11, C = 12, D = 13, E = 14, F = 15. Hexadecimal uses base-16 with digits 0–9 and letters A–F.'
      },
      {
        id: 'ict-hex-4',
        q: 'List four major uses of hexadecimal in computer systems.',
        a: '1. MAC Addresses (e.g. 00:1A:2B:3C:4D:5E)\n2. IPv6 Addresses (e.g. 2001:0db8:85a3::8a2e:0370:7334)\n3. HTML / CSS Colour Codes (e.g. #FF5733: Red=FF, Green=57, Blue=33)\n4. Memory Dumps and Error Codes during program debugging.'
      },
      {
        id: 'ict-hex-5',
        q: 'Convert the hexadecimal number 3F into denary.',
        a: 'Place values for hex are 16 and 1:\n3 × 16 = 48\nF = 15 × 1 = 15\nSum: 48 + 15 = 63 (denary).'
      }
    ],
    cheatsheet: {
      key_formulae: [
        'Hexadecimal Base: 16 (Digits: 0,1,2,3,4,5,6,7,8,9, A=10, B=11, C=12, D=13, E=14, F=15)',
        '1 Hex Digit = 1 Nibble (4 bits). 2 Hex Digits = 1 Byte (8 bits)',
        'Binary to Hex: Split into groups of 4 bits from right to left, convert each nibble to hex digit',
        'Hex to Denary: (First Digit × 16) + Second Digit'
      ],
      exam_rules: [
        'Never write 10, 11, 12, 13, 14, 15 as single hex digits — always use letters A, B, C, D, E, F.',
        'When converting binary to hex, group from right to left (pad with leading zeros if total bits not multiple of 4).'
      ],
      common_pitfalls: [
        'Confusing hex A (10) with 10 (which in hex is 16 in denary).',
        'Writing that the computer processes hex directly (the computer ONLY processes binary; hex is purely for human readability).'
      ],
      examiner_tips: [
        'Always state that hex makes numbers "shorter and easier for humans to read and debug", not that it "saves computer memory".'
      ]
    }
  },

  // =========================================================================
  // ICT / COMPUTER SCIENCE — BINARY ADDITION & LOGICAL SHIFTS
  // =========================================================================
  {
    subjectMatch: 'ict|computer',
    topicMatch: 'addition of binary|binary addition|binary shift|logical shift',
    flashcards: [
      {
        id: 'ict-add-1',
        q: 'State the four rules of binary addition.',
        a: '• 0 + 0 = 0\n• 1 + 0 = 1\n• 1 + 1 = 0 (carry 1 to next column)\n• 1 + 1 + 1 = 1 (carry 1 to next column).'
      },
      {
        id: 'ict-add-2',
        q: 'What is an overflow error in binary addition?',
        a: 'An overflow error occurs when the addition of two binary numbers produces a result that exceeds the maximum size of the accumulator/register (e.g. adding two 8-bit numbers produces a 9-bit result > 255). The carry bit is lost, causing inaccurate results.'
      },
      {
        id: 'ict-add-3',
        q: 'What is the mathematical effect of a logical binary left shift and right shift?',
        a: '• Logical Left Shift by 1 position: Multiplies the number by 2 (vacant right bit filled with 0).\n• Logical Right Shift by 1 position: Divides the number by 2 (integer division; vacant left bit filled with 0).'
      },
      {
        id: 'ict-add-4',
        q: 'Perform a 2-place logical left shift on 00010100 (denary 20).',
        a: 'Shift all bits left by 2 positions, discarding MSBs and filling right with 00:\n01010000 (denary 80, which is 20 × 2² = 80).'
      }
    ],
    cheatsheet: {
      key_formulae: [
        'Binary Addition: 0+0=0 | 1+0=1 | 1+1=0 (c 1) | 1+1+1=1 (c 1)',
        'Logical Left Shift by n places = Multiply by 2ⁿ',
        'Logical Right Shift by n places = Divide by 2ⁿ (integer division)',
        'Overflow: Result > 255 in an 8-bit register triggers the overflow flag'
      ],
      exam_rules: [
        'In binary addition working, write carry bits clearly at the top or bottom of your column working.',
        'In shift questions, fill empty bit positions with zeros.'
      ],
      common_pitfalls: [
        'Forgetting that bits shifted off the edge are lost, which causes precision loss or overflow.'
      ]
    }
  },

  // =========================================================================
  // ICT / COMPUTER SCIENCE — TWO'S COMPLEMENT & SIGNED NUMBERS
  // =========================================================================
  {
    subjectMatch: 'ict|computer',
    topicMatch: 'two\'s complement|twos complement|signed binary|signed number|negative',
    flashcards: [
      {
        id: 'ict-tc-1',
        q: 'How does Two\'s Complement represent negative integers in an 8-bit byte?',
        a: 'The Most Significant Bit (MSB, bit 7) carries a negative weight of -128. Bits 0 to 6 retain positive weights (64, 32, 16, 8, 4, 2, 1). If the MSB is 1, the number is negative.'
      },
      {
        id: 'ict-tc-2',
        q: 'How do you convert a positive denary number (e.g. +35) to its negative Two\'s Complement form (-35)?',
        a: '1. Write positive 35 in 8-bit binary: 00100011\n2. Invert all bits (one\'s complement): 11011100\n3. Add 1: 11011101 (-35).'
      },
      {
        id: 'ict-tc-3',
        q: 'What is the range of integers that can be represented using 8-bit Two\'s Complement?',
        a: '-128 to +127. Formula: -2ⁿ⁻¹ to +(2ⁿ⁻¹ - 1).'
      }
    ],
    cheatsheet: {
      key_formulae: [
        '8-Bit Two\'s Complement Place Values: -128 | 64 | 32 | 16 | 8 | 4 | 2 | 1',
        'Conversion: Invert all bits (0→1, 1→0) and add 1 (+1)',
        'Range for n bits: -2ⁿ⁻¹ to +(2ⁿ⁻¹ - 1)'
      ],
      exam_rules: [
        'Always ensure your answer has exactly 8 bits.',
        'Positive numbers ALWAYS have MSB = 0; negative numbers ALWAYS have MSB = 1.'
      ],
      common_pitfalls: [
        'Forgetting to add 1 after inverting the bits.',
        'Thinking the range goes up to +128 (maximum positive is +127 because 0 is non-negative).'
      ]
    }
  },

  // =========================================================================
  // ICT / COMPUTER SCIENCE — CHARACTER REPRESENTATION (ASCII & UNICODE)
  // =========================================================================
  {
    subjectMatch: 'ict|computer',
    topicMatch: 'ascii|unicode|character',
    flashcards: [
      {
        id: 'ict-chr-1',
        q: 'What is the difference between standard ASCII and extended ASCII?',
        a: 'Standard ASCII uses 7 bits, representing 128 unique characters (0 to 127, English letters, digits, control codes). Extended ASCII uses 8 bits, representing 256 unique characters (including European accented letters and symbols).'
      },
      {
        id: 'ict-chr-2',
        q: 'Why was Unicode developed to replace ASCII?',
        a: 'ASCII only supported English and Western European characters (max 256). Unicode uses variable-width encoding (up to 32 bits, e.g. UTF-8) capable of representing over 1.1 million characters across all world languages, historical scripts, and mathematical symbols.'
      }
    ],
    cheatsheet: {
      key_formulae: [
        'Standard ASCII: 7 bits per character = 128 characters (2⁷)',
        'Extended ASCII: 8 bits per character = 256 characters (2⁸)',
        'Unicode UTF-8: 1 to 4 Bytes (8 to 32 bits) per character (> 1.1 million characters)'
      ],
      exam_rules: [
        'State that uppercase and lowercase letters have different character codes in ASCII (e.g. \'A\' is 65, \'a\' is 97; difference is 32).'
      ],
      common_pitfalls: [
        'Saying ASCII stores images or sounds — ASCII only stores text character mappings.'
      ]
    }
  },

  // =========================================================================
  // ICT / COMPUTER SCIENCE — SOUND REPRESENTATION
  // =========================================================================
  {
    subjectMatch: 'ict|computer',
    topicMatch: 'sound|audio|sample rate|bit depth',
    flashcards: [
      {
        id: 'ict-snd-1',
        q: 'How is continuous analogue sound converted to digital audio?',
        a: 'Sound waves are sampled at regular intervals using an Analogue-to-Digital Converter (ADC). The amplitude of the wave is measured and recorded as binary values.'
      },
      {
        id: 'ict-snd-2',
        q: 'Define Sample Rate and Sample Resolution (Bit Depth).',
        a: '• Sample Rate: Number of audio samples recorded per second (measured in Hertz, Hz).\n• Sample Resolution: Number of bits allocated to store the amplitude of each sample (determines dynamic range).'
      },
      {
        id: 'ict-snd-3',
        q: 'What is the effect of increasing sample rate and sample resolution on sound quality and file size?',
        a: 'Higher sample rate and resolution produce audio that is closer to the original analogue sound with less quantisation distortion, but significantly increases the resulting audio file size.'
      }
    ],
    cheatsheet: {
      key_formulae: [
        'Sound File Size (bits) = Sample Rate (Hz) × Sample Resolution (bits) × Duration (seconds) × Channels',
        'Mono = 1 Channel; Stereo = 2 Channels',
        'Divide bits by 8 to get Bytes; divide by 1,024 for KiB, or 1,048,576 for MiB'
      ],
      exam_rules: [
        'Always verify if sound is Mono (1 channel) or Stereo (multiply by 2).',
        'Clearly state conversion steps from bits to Bytes (÷ 8) and KiB (÷ 1024).'
      ],
      common_pitfalls: [
        'Forgetting to multiply by 2 for stereo audio.'
      ]
    }
  },

  // =========================================================================
  // ICT / COMPUTER SCIENCE — IMAGE REPRESENTATION & FILE SIZES
  // =========================================================================
  {
    subjectMatch: 'ict|computer',
    topicMatch: 'image|pixel|resolution|colour depth|bitmap|vector|file size',
    flashcards: [
      {
        id: 'ict-img-1',
        q: 'What is a pixel and what is image resolution?',
        a: 'A pixel (picture element) is the smallest single addressable component of a bitmap image. Image resolution is the total number of pixels in the image (expressed as Horizontal Pixels × Vertical Pixels).'
      },
      {
        id: 'ict-img-2',
        q: 'Define Colour Depth and its formula for number of colours.',
        a: 'Colour depth is the number of bits used to represent the colour of a single pixel. Number of colours = 2^(colour depth). (e.g. 8-bit depth = 256 colours; 24-bit True Colour = 16.7 million colours).'
      },
      {
        id: 'ict-img-3',
        q: 'How is the file size of a bitmap image calculated?',
        a: 'Image Size (bits) = Width (pixels) × Height (pixels) × Colour Depth (bits).\nTo convert to Bytes, divide by 8.'
      }
    ],
    cheatsheet: {
      key_formulae: [
        'Bitmap Image File Size (bits) = Width × Height × Colour Depth (bits)',
        'Number of Colours = 2ⁿ (where n is colour depth in bits)',
        'Image Metadata: Stores dimensions (resolution), colour depth, and creation date'
      ],
      exam_rules: [
        'State units clearly (bits, Bytes, KiB, MiB).',
        'Show all multiplication and division steps explicitly.'
      ],
      common_pitfalls: [
        'Confusing colour depth (bits per pixel) with image resolution (total pixels).'
      ]
    }
  },

  // =========================================================================
  // ICT / COMPUTER SCIENCE — DATA COMPRESSION
  // =========================================================================
  {
    subjectMatch: 'ict|computer',
    topicMatch: 'compression|lossy|lossless|jpeg|mp3',
    flashcards: [
      {
        id: 'ict-cmp-1',
        q: 'What is the key difference between Lossy and Lossless compression?',
        a: '• Lossy (e.g. JPEG, MP3, MP4): Permanently deletes redundant or imperceptible data (e.g. frequencies outside human hearing). File size is greatly reduced but original fidelity cannot be restored.\n• Lossless (e.g. PNG, ZIP, FLAC, RLE): Compresses data using algorithms without losing any original bits. Original file can be reconstructed with 100% exact accuracy.'
      },
      {
        id: 'ict-cmp-2',
        q: 'How does Run-Length Encoding (RLE) work in lossless compression?',
        a: 'RLE replaces consecutive repeated data values (runs) with a single value count and the data value itself (e.g. "AAAAABBBCC" becomes "5A3B2C"), significantly reducing file size when large blocks of repeated data exist.'
      }
    ],
    cheatsheet: {
      key_formulae: [
        'Compression Ratio = Uncompressed Size ÷ Compressed Size',
        'Lossy Formats: JPEG (images), MP3 (audio), MP4 (video)',
        'Lossless Formats: PNG, GIF, ZIP, FLAC, RLE'
      ],
      exam_rules: [
        'State that Lossless compression is mandatory for text, programs, and financial spreadsheets where no data loss can be tolerated.',
        'Never say lossless compression loses quality — lossless retains 100% of original data.'
      ],
      common_pitfalls: [
        'Saying MP3 is lossless (MP3 is lossy audio compression).'
      ]
    }
  },

  // =========================================================================
  // ICT / COMPUTER SCIENCE — DATA TRANSMISSION & NETWORKING
  // =========================================================================
  {
    subjectMatch: 'ict|computer',
    topicMatch: 'transmission|network|packet|mac|ip|parity|checksum|internet',
    flashcards: [
      {
        id: 'ict-net-1',
        q: 'What are the three components of a data packet?',
        a: '1. Header (Sender/Receiver IP, packet number, protocol)\n2. Payload (The actual data content)\n3. Trailer (End of packet marker, error checking like checksum or CRC).'
      },
      {
        id: 'ict-net-2',
        q: 'Compare Simplex, Half-Duplex, and Full-Duplex transmission.',
        a: 'Simplex: Data travels in one direction only (e.g. radio broadcast).\nHalf-Duplex: Both directions, but only one at a time (e.g. walkie-talkie).\nFull-Duplex: Simultaneous two-way transmission (e.g. broadband fibre).'
      },
      {
        id: 'ict-net-3',
        q: 'What is the difference between a MAC address and an IP address?',
        a: 'A MAC address is a permanent physical identifier assigned to the NIC by the manufacturer (48-bit hex). An IP address is a logical address dynamically or statically assigned to identify a device\'s location on a network.'
      },
      {
        id: 'ict-net-4',
        q: 'How does an odd parity check detect transmission errors?',
        a: 'The transmitter counts the 1s in the byte and sets the parity bit so the total number of 1s is odd. If the receiver counts an even number of 1s, an error is detected and retransmission is requested.'
      },
      {
        id: 'ict-net-5',
        q: 'Why can a simple parity check fail to detect an error?',
        a: 'If an even number of bits (e.g. two bits) flip during transmission, the parity count remains unchanged, so the error passes undetected. A Parity Block or Checksum solves this.'
      }
    ],
    cheatsheet: {
      key_formulae: [
        'Transmission Speed: Time = Data Size (bits) / Bandwidth (bps)',
        'Parity Bit: Total 1s must be Even (Even Parity) or Odd (Odd Parity)',
        'IPv4 (32 bits, 4 denary octets) vs IPv6 (128 bits, 8 hex hextets)'
      ],
      exam_rules: [
        'State both sender and receiver actions when explaining error detection (ARQ, Parity, Checksum).',
        'State that packet switching sends packets along dynamic, independent routes.',
        'Distinguish Serial (single wire, long distance) from Parallel (multiple wires, short distance skew).'
      ],
      common_pitfalls: [
        'Saying MAC addresses change when you connect to a new Wi-Fi network (only IP changes).',
        'Confusing bandwidth (capacity) with latency (delay).'
      ],
      examiner_tips: [
        'When describing ARQ, mention the Timeout interval and Negative Acknowledgement (NACK).'
      ]
    }
  },

  // =========================================================================
  // ICT / COMPUTER SCIENCE — HARDWARE & STORAGE
  // =========================================================================
  {
    subjectMatch: 'ict|computer',
    topicMatch: 'hardware|storage|cpu|ram|rom|solid state|hdd|sensor|memory',
    flashcards: [
      {
        id: 'ict-hw-1',
        q: 'What happens during the Fetch-Decode-Execute cycle?',
        a: '• Fetch: PC sends address to MAR via address bus; instruction fetched via data bus into MDR, copied to CIR, PC increments.\n• Decode: Control Unit decodes instruction in CIR.\n• Execute: ALU performs calculation or data is written to memory.'
      },
      {
        id: 'ict-hw-2',
        q: 'Compare RAM and ROM.',
        a: 'RAM is volatile (loses contents on power off), read-and-write, stores currently running programs and OS data. ROM is non-volatile, read-only, stores BIOS/bootloader instructions.'
      },
      {
        id: 'ict-hw-3',
        q: 'Why are Solid State Drives (SSD) preferred over Hard Disk Drives (HDD) for portable devices?',
        a: 'SSDs have no moving parts (flash NAND gates), making them shock-resistant, silent, significantly faster in read/write latency, and lower power-consuming.'
      },
      {
        id: 'ict-hw-4',
        q: 'Explain how an optical disc (CD/DVD) reads data.',
        a: 'A laser beam shines onto a reflective spiral track with pits and lands. When the beam hits a transition between a pit and land, light scatters, representing a binary 1; continuous lands or pits reflect light, representing 0.'
      }
    ],
    cheatsheet: {
      key_formulae: [
        'Von Neumann Registers: PC (Program Counter), MAR, MDR, CIR, ACC (Accumulator)',
        'Buses: Address Bus (unidirectional), Data Bus (bidirectional), Control Bus (bidirectional)',
        'Clock Speed: Number of F-D-E cycles per second (measured in GHz)'
      ],
      exam_rules: [
        'Address bus is ALWAYS unidirectional (from CPU to memory).',
        'Never state RAM "runs" programs — the CPU runs programs; RAM stores them during execution.',
        'Specify sensors measure analogue physical properties; ADC converts them to digital.'
      ],
      common_pitfalls: [
        'Writing that sensors make decisions — sensors only measure data; the microprocessor compares sensor readings against set points and makes decisions.'
      ]
    }
  },

  // =========================================================================
  // ICT / COMPUTER SCIENCE — LOGIC GATES & BOOLEAN ALGEBRA
  // =========================================================================
  {
    subjectMatch: 'ict|computer',
    topicMatch: 'logic|boolean|truth table|gate|nand|nor|xor',
    flashcards: [
      {
        id: 'ict-log-1',
        q: 'What is the output rule for an XOR (Exclusive OR) gate?',
        a: 'The output is 1 ONLY when the inputs are different (one input is 1 and the other is 0). If both inputs are 0 or both are 1, output is 0.'
      },
      {
        id: 'ict-log-2',
        q: 'Why is NAND known as a universal gate?',
        a: 'Any Boolean logic circuit (AND, OR, NOT, XOR) can be constructed entirely using only NAND gates.'
      },
      {
        id: 'ict-log-3',
        q: 'State the truth table output for a NOR gate with inputs A and B.',
        a: 'Output is 1 ONLY when both inputs A and B are 0. (A=0,B=0 -> 1; A=0,B=1 -> 0; A=1,B=0 -> 0; A=1,B=1 -> 0).'
      }
    ],
    cheatsheet: {
      key_formulae: [
        'AND: Output = A · B (1 only if both 1)',
        'OR: Output = A + B (1 if at least one 1)',
        'NOT: Output = Ā (invert)',
        'NAND: Output = (A · B)̄ (0 only if both 1)',
        'NOR: Output = (A + B)̄ (1 only if both 0)',
        'XOR: Output = A ⊕ B = A·B̄ + Ā·B'
      ],
      exam_rules: [
        'Draw distinct logic gate shapes; clearly show the inversion circle on NOT, NAND, and NOR.',
        'In truth tables with 3 inputs (A, B, C), list rows in standard binary order from 000 to 111 (8 rows).'
      ],
      common_pitfalls: [
        'Confusing OR gate with XOR gate when both inputs are 1.',
        'Forgetting the inverter circle on NAND/NOR gates.'
      ]
    }
  },

  // =========================================================================
  // MATHEMATICS — ALGEBRA & EQUATIONS (IGCSE 0580 / O-Level 4024 / A-Level 9709)
  // =========================================================================
  {
    subjectMatch: 'math',
    topicMatch: 'algebra|equation|quadratic|linear|indices|surd|inequalit|polynomial',
    flashcards: [
      {
        id: 'math-alg-1',
        q: 'What is the Quadratic Formula for solving ax² + bx + c = 0?',
        a: 'x = (-b ± √(b² - 4ac)) / (2a). The discriminant Δ = b² - 4ac determines the nature of roots (Δ > 0: two real roots; Δ = 0: one repeated root; Δ < 0: no real roots).'
      },
      {
        id: 'math-alg-2',
        q: 'State the laws of indices for multiplication, division, and fractional powers.',
        a: '• aᵐ × aⁿ = aᵐ⁺ⁿ\n• aᵐ ÷ aⁿ = aᵐ⁻ⁿ\n• (aᵐ)ⁿ = aᵐⁿ\n• a⁰ = 1\n• a⁻ⁿ = 1 / aⁿ\n• a^(m/n) = ⁿ√(aᵐ)'
      },
      {
        id: 'math-alg-3',
        q: 'How do you rationalize the denominator of a fraction with a surd like 3 / (√5 - 2)?',
        a: 'Multiply both numerator and denominator by the conjugate (√5 + 2). Using difference of two squares: (√5 - 2)(√5 + 2) = 5 - 4 = 1. Result: 3(√5 + 2).'
      },
      {
        id: 'math-alg-4',
        q: 'What is the rule when multiplying or dividing an inequality by a negative number?',
        a: 'You MUST reverse the direction of the inequality sign! E.g. -2x < 6 becomes x > -3.'
      },
      {
        id: 'math-alg-5',
        q: 'How do you complete the square for x² + bx + c?',
        a: 'Write as (x + b/2)² - (b/2)² + c. The minimum/maximum turning point of the curve is at (-b/2, c - (b/2)²).'
      }
    ],
    cheatsheet: {
      key_formulae: [
        'Quadratic Formula: x = [-b ± √(b² - 4ac)] / 2a',
        'Difference of Two Squares: a² - b² = (a - b)(a + b)',
        'Completed Square Form: a(x + p)² + q with vertex at (-p, q)',
        'Simultaneous Elimination: Multiply coefficients to match, add if signs opposite, subtract if same',
        'Fractional Indices: x^(a/b) = (ᵇ√x)ᵃ'
      ],
      exam_rules: [
        'Always show substitution into the quadratic formula before evaluating to secure the Method (M1) mark.',
        'Give answers to 3 significant figures unless the question specifies exact fractions or surds.',
        'Do not omit the ± sign when taking square roots on both sides of an equation.'
      ],
      common_pitfalls: [
        'Sign error with -b when b is already negative (e.g. -(-5) = +5).',
        'Expanding (x + 3)² as x² + 9 (correct: x² + 6x + 9).',
        'Dividing an equation by x and losing the x = 0 root.'
      ]
    }
  },

  // =========================================================================
  // MATHEMATICS — FUNCTIONS & GRAPHS
  // =========================================================================
  {
    subjectMatch: 'math',
    topicMatch: 'function|graph|gradient|asymptote|inverse|composite|tangent',
    flashcards: [
      {
        id: 'math-fn-1',
        q: 'How do you find the inverse function f⁻¹(x)?',
        a: '1. Set y = f(x)\n2. Rearrange the equation to make x the subject in terms of y\n3. Swap x and y to write f⁻¹(x).'
      },
      {
        id: 'math-fn-2',
        q: 'What is the relationship between the graph of y = f(x) and y = f⁻¹(x)?',
        a: 'The graph of y = f⁻¹(x) is the reflection of y = f(x) in the line y = x.'
      },
      {
        id: 'math-fn-3',
        q: 'How do you calculate the gradient of a curve at a given point without calculus?',
        a: 'Draw a tangent to the curve at that exact point and calculate gradient = (y₂ - y₁) / (x₂ - x₁).'
      }
    ],
    cheatsheet: {
      key_formulae: [
        'Gradient m = (y₂ - y₁) / (x₂ - x₁)',
        'Perpendicular Line Gradient: m₁ × m₂ = -1  →  m₂ = -1 / m₁',
        'Composite Function: fg(x) means evaluate g(x) first, then substitute into f',
        'Turning Point / Vertex: x = -b / (2a)'
      ],
      exam_rules: [
        'When plotting graphs, use small neat crosses (×), not big blobs.',
        'Show the tangent line clearly on the curve when estimating gradient.'
      ],
      common_pitfalls: [
        'Calculating gf(x) instead of fg(x) — remember fg(x) applies g FIRST, then f.',
        'Confusing f⁻¹(x) with 1 / f(x).'
      ]
    }
  },

  // =========================================================================
  // MATHEMATICS — NUMBER, ARITHMETIC & PERCENTAGES
  // =========================================================================
  {
    subjectMatch: 'math',
    topicMatch: 'number|arithmetic|percentage|ratio|fraction|standard form|upper bound|lower bound',
    flashcards: [
      {
        id: 'math-num-1',
        q: 'How do you calculate percentage increase or decrease?',
        a: 'Percentage Change = (Actual Change / Original Amount) × 100%.'
      },
      {
        id: 'math-num-2',
        q: 'What is the rule for finding Upper and Lower Bounds?',
        a: 'Divide the unit of rounding by 2. Add this half-unit for Upper Bound; subtract it for Lower Bound.\nE.g. 50 cm rounded to nearest 10 cm: UB = 55 cm, LB = 45 cm.'
      },
      {
        id: 'math-num-3',
        q: 'What is the formula for Compound Interest?',
        a: 'Total Amount A = P(1 + r/100)ⁿ, where P is Principal, r is annual interest rate %, and n is number of years.'
      }
    ],
    cheatsheet: {
      key_formulae: [
        'Reverse Percentage: Original Value = Final Value ÷ (1 ± rate/100)',
        'Compound Interest: A = P(1 + r/100)ⁿ',
        'Standard Form: A × 10ⁿ, where 1 ≤ A < 10 and n is an integer',
        'Bound division: Max(A/B) = Upper(A) / Lower(B)'
      ],
      exam_rules: [
        'In reverse percentage questions, NEVER calculate the percentage of the final increased price.',
        'State answers to money questions correct to 2 decimal places.'
      ],
      common_pitfalls: [
        'Rounding off intermediate steps in multi-step calculations.',
        'Using Lower(B) when finding maximum difference A - B.'
      ]
    }
  },

  // =========================================================================
  // MATHEMATICS — GEOMETRY, TRIGONOMETRY & MENSURATION
  // =========================================================================
  {
    subjectMatch: 'math',
    topicMatch: 'geometry|trigonometry|mensuration|circle|area|volume|triangle|vector',
    flashcards: [
      {
        id: 'math-geom-1',
        q: 'State the Sine Rule and when it is used.',
        a: 'a / sin(A) = b / sin(B) = c / sin(C). Used in non-right-angled triangles when you know an angle and its opposite side plus one other piece of information.'
      },
      {
        id: 'math-geom-2',
        q: 'State the Cosine Rule for finding a side and an angle.',
        a: 'Side: a² = b² + c² - 2bc cos(A)\nAngle: cos(A) = (b² + c² - a²) / (2bc). Used when you have SAS (two sides and included angle) or SSS (three sides).'
      },
      {
        id: 'math-geom-3',
        q: 'State three key Circle Theorems frequently tested in Cambridge papers.',
        a: '1. Angle at centre is twice angle at circumference.\n2. Angles in the same segment are equal.\n3. Opposite angles of a cyclic quadrilateral sum to 180°.\n4. Angle between tangent and radius is 90°.'
      }
    ],
    cheatsheet: {
      key_formulae: [
        'Area of Triangle: ½ab sin(C)',
        'Arc Length: (θ / 360) × 2πr; Sector Area: (θ / 360) × πr²',
        'Volume of Cylinder = πr²h; Cone = ⅓πr²h; Sphere = ⁴⁄₃πr³',
        'Vector Magnitude: |v| = √(x² + y²)'
      ],
      exam_rules: [
        'Always write full geometric reasons (e.g. "angle at centre is twice angle at circumference").',
        'Check calculator angle mode is set to DEGREES (DEG).'
      ],
      common_pitfalls: [
        'Using Pythagorean theorem on non-right-angled triangles.',
        'Writing single-word reasons like "circle" instead of standard Cambridge theorem names.'
      ]
    }
  },

  // =========================================================================
  // MATHEMATICS — PROBABILITY & STATISTICS
  // =========================================================================
  {
    subjectMatch: 'math',
    topicMatch: 'probability|statistic|venn|mean|median|histogram|cumulative|quartile',
    flashcards: [
      {
        id: 'math-prob-1',
        q: 'What is the rule for independent vs mutually exclusive events in probability?',
        a: 'Independent: P(A and B) = P(A) × P(B).\nMutually Exclusive: P(A or B) = P(A) + P(B).'
      },
      {
        id: 'math-prob-2',
        q: 'How is Frequency Density calculated in a Histogram?',
        a: 'Frequency Density = Frequency / Class Width. The AREA of each bar represents the frequency.'
      },
      {
        id: 'math-prob-3',
        q: 'How do you find the Interquartile Range (IQR) from a cumulative frequency curve?',
        a: 'IQR = Upper Quartile (Q3 at 75% of total frequency) - Lower Quartile (Q1 at 25% of total frequency).'
      }
    ],
    cheatsheet: {
      key_formulae: [
        'Probability: P(Event) = Favourable Outcomes / Total Possible Outcomes',
        'Conditional: P(A|B) = P(A ∩ B) / P(B)',
        'Mean of Grouped Data: x̄ = Σ(fx) / Σf (where x is class midpoint)',
        'Histogram: Frequency Density = Frequency ÷ Class Width'
      ],
      exam_rules: [
        'Branch probabilities in tree diagrams must sum to 1.',
        'In "without replacement" questions, remember both numerator and denominator reduce for the second draw.'
      ],
      common_pitfalls: [
        'Plotting cumulative frequency at midpoints instead of upper class boundaries.',
        'Multiplying probabilities when events are not independent.'
      ]
    }
  },

  // =========================================================================
  // PHYSICS — MOTION, FORCES & ENERGY
  // =========================================================================
  {
    subjectMatch: 'physics',
    topicMatch: 'motion|force|energy|velocity|acceleration|momentum|hooke|work|power',
    flashcards: [
      {
        id: 'phy-mot-1',
        q: 'State Newton\'s Three Laws of Motion.',
        a: '1. An object remains at rest or constant velocity unless acted upon by a resultant external force.\n2. Resultant Force F = ma.\n3. When body A exerts a force on body B, body B exerts an equal and opposite force on body A.'
      },
      {
        id: 'phy-mot-2',
        q: 'What do the gradient and area represent on Velocity-Time and Distance-Time graphs?',
        a: '• Distance-Time: Gradient = Speed / Velocity.\n• Velocity-Time: Gradient = Acceleration; Area under curve = Distance travelled.'
      },
      {
        id: 'phy-mot-3',
        q: 'What is the Principle of Conservation of Momentum?',
        a: 'Total momentum before a collision or explosion equals total momentum after, provided no external resultant force acts on the system: m₁u₁ + m₂u₂ = m₁v₁ + m₂v₂.'
      }
    ],
    cheatsheet: {
      key_formulae: [
        'Speed v = d / t; Acceleration a = (v - u) / t',
        'Newton\'s Second Law: F = ma; Weight W = mg',
        'Work Done W = F × d; Kinetic Energy Ek = ½mv²',
        'Gravitational Potential Energy Ep = mgh; Power P = W / t = Fv',
        'Momentum p = mv; Impulse = FΔt = Δp'
      ],
      exam_rules: [
        'Vectors have magnitude AND direction — state both when asked for velocity or force.',
        'Use g = 9.8 m/s² (or 10 m/s² if specified in the paper header).'
      ],
      common_pitfalls: [
        'Confusing mass (kg, scalar) with weight (N, vector).',
        'Forgetting to square velocity in Ek = ½mv².'
      ]
    }
  },

  // =========================================================================
  // PHYSICS — THERMAL PHYSICS
  // =========================================================================
  {
    subjectMatch: 'physics',
    topicMatch: 'thermal|heat|temperature|conduction|convection|radiation|specific heat|evaporation',
    flashcards: [
      {
        id: 'phy-thm-1',
        q: 'Explain the difference between boiling and evaporation in terms of kinetic theory.',
        a: 'Evaporation occurs at any temperature from the surface only as energetic molecules escape, cooling the liquid. Boiling occurs throughout the liquid at a fixed temperature where vapour pressure equals atmospheric pressure.'
      },
      {
        id: 'phy-thm-2',
        q: 'Define Specific Heat Capacity (c).',
        a: 'The energy required to raise the temperature of 1 kg of a substance by 1 °C (or 1 K). Formula: ΔE = mcΔθ.'
      },
      {
        id: 'phy-thm-3',
        q: 'Compare conduction, convection, and radiation.',
        a: 'Conduction: Energy transfer through vibrating lattice particles and delocalised electrons (solids).\nConvection: Circulation of fluid due to density changes upon heating (liquids/gases).\nRadiation: Electromagnetic infrared waves requiring NO medium (can travel in vacuum).'
      }
    ],
    cheatsheet: {
      key_formulae: [
        'Thermal Energy: ΔE = mcΔθ (c in J/(kg·°C))',
        'Latent Heat: E = mL (Lf = fusion, Lv = vaporisation)',
        'Ideal Gas Law: P₁V₁ / T₁ = P₂V₂ / T₂ (Temperature in Kelvin: K = °C + 273)'
      ],
      exam_rules: [
        'Gas law calculations MUST use absolute temperature in Kelvin (K).',
        'During a state change, temperature remains constant because energy breaks intermolecular bonds.'
      ],
      common_pitfalls: [
        'Using °C instead of Kelvin in gas laws.',
        'Saying heat "rises" — warmer fluid expands, becomes less dense, and is displaced upwards.'
      ]
    }
  },

  // =========================================================================
  // PHYSICS — WAVES & LIGHT
  // =========================================================================
  {
    subjectMatch: 'physics',
    topicMatch: 'wave|light|sound|reflection|refraction|diffraction|lens|spectrum',
    flashcards: [
      {
        id: 'phy-wav-1',
        q: 'State the wave equation and define each term.',
        a: 'v = fλ, where v = wave speed (m/s), f = frequency (Hz), and λ = wavelength (m).'
      },
      {
        id: 'phy-wav-2',
        q: 'What is Total Internal Reflection (TIR) and its two conditions?',
        a: 'Light reflects completely inside a medium without refracting. Conditions:\n1. Light travels from a more dense to a less dense medium.\n2. Angle of incidence is greater than the critical angle (i > c).'
      },
      {
        id: 'phy-wav-3',
        q: 'List the EM Spectrum in order of increasing frequency.',
        a: 'Radio → Microwave → Infrared → Visible Light → Ultraviolet → X-rays → Gamma rays. All travel at 3.0 × 10⁸ m/s in vacuum.'
      }
    ],
    cheatsheet: {
      key_formulae: [
        'Wave Speed: v = fλ; Frequency f = 1 / T',
        'Refractive Index: n = sin(i) / sin(r) = c / v = 1 / sin(c)',
        'Echo Distance: 2d = v × t (for sound reflection/sonar)'
      ],
      exam_rules: [
        'Angles of incidence and refraction are ALWAYS measured to the NORMAL line (90° to surface).',
        'In echo calculations, remember sound travels to the barrier and back (distance is 2d).'
      ],
      common_pitfalls: [
        'Measuring angles from the glass boundary rather than the normal.',
        'Forgetting frequency remains unchanged when a wave enters a different medium.'
      ]
    }
  },

  // =========================================================================
  // PHYSICS — ELECTRICITY & MAGNETISM
  // =========================================================================
  {
    subjectMatch: 'physics',
    topicMatch: 'electric|circuit|resistance|ohm|current|voltage|magnetic|induction|transformer',
    flashcards: [
      {
        id: 'phy-elec-1',
        q: 'State Ohm\'s Law and its condition.',
        a: 'Current through a conductor is directly proportional to the potential difference across it, provided temperature remains constant: V = IR.'
      },
      {
        id: 'phy-elec-2',
        q: 'How do current and voltage behave in series vs parallel circuits?',
        a: '• Series: Current is identical everywhere; Voltages sum: V_total = V₁ + V₂.\n• Parallel: Voltage across each branch is equal; Currents sum: I_total = I₁ + I₂.'
      },
      {
        id: 'phy-elec-3',
        q: 'What is Fleming\'s Left-Hand Rule and when is it used?',
        a: 'Used for the motor effect (force on current in magnetic field):\n• Thumb = Motion / Force (F)\n• First Finger = Magnetic Field (B, North to South)\n• Second Finger = Conventional Current (I, Positive to Negative).'
      }
    ],
    cheatsheet: {
      key_formulae: [
        'Current I = Q / t; Voltage V = W / Q = IR',
        'Electrical Power: P = IV = I²R = V² / R; Energy E = Pt = IVt',
        'Series Resistance: R = R₁ + R₂; Parallel: 1/R = 1/R₁ + 1/R₂',
        'Transformer: Vp / Vs = Np / Ns = Is / Ip (100% efficient)'
      ],
      exam_rules: [
        'Ammeters must be connected in SERIES; Voltmeters in PARALLEL.',
        'Conventional current flows from POSITIVE to NEGATIVE; electrons flow from negative to positive.'
      ],
      common_pitfalls: [
        'In parallel resistance, calculating 1/R and forgetting to take the reciprocal to get R.',
        'Confusing step-up (steps voltage UP, current DOWN) with step-down transformers.'
      ]
    }
  },

  // =========================================================================
  // CHEMISTRY — ATOMIC STRUCTURE, BONDING & PERIODIC TABLE
  // =========================================================================
  {
    subjectMatch: 'chem',
    topicMatch: 'atom|structure|bonding|ionic|covalent|metallic|periodic|element',
    flashcards: [
      {
        id: 'chm-bnd-1',
        q: 'Describe ionic bonding and why ionic compounds conduct electricity when molten but not solid.',
        a: 'Ionic bonding is the strong electrostatic attraction between oppositely charged ions. In solid state, ions are locked in a fixed lattice; when molten or dissolved, ions become free to move and carry charge.'
      },
      {
        id: 'chm-bnd-2',
        q: 'Compare giant covalent structures (Diamond vs Graphite).',
        a: 'Diamond: Each carbon forms 4 strong covalent bonds in a tetrahedral lattice; extremely hard, non-conductor. Graphite: Each carbon forms 3 bonds in hexagonal layers with delocalised electrons; soft (layers slide) and conducts electricity.'
      },
      {
        id: 'chm-bnd-3',
        q: 'Explain the trend in reactivity down Group 1 (Alkali Metals).',
        a: 'Reactivity increases down Group 1. Outer electron is further from the nucleus, shielded by more electron shells, so electrostatic attraction is weaker and the single electron is lost more readily.'
      }
    ],
    cheatsheet: {
      key_formulae: [
        'Relative Atomic Mass Ar = Σ(Isotope Mass × % Abundance) / 100',
        'Group 1: Reactivity increases DOWN; Group 7 (Halogens): Reactivity increases UP',
        'Metallic Bonding: Lattice of positive metal ions in a sea of delocalised electrons'
      ],
      exam_rules: [
        'In ionic conduction questions, specify that "IONS are free to move", NOT electrons.',
        'Graphite conducts because it has "delocalised electrons free to move throughout the layers".'
      ],
      common_pitfalls: [
        'Saying covalent bonds break when simple molecular substances melt (only weak intermolecular forces break).',
        'Saying ionic solids conduct because electrons are free (it is ions, not electrons).'
      ]
    }
  },

  // =========================================================================
  // CHEMISTRY — STOICHIOMETRY & MOLES
  // =========================================================================
  {
    subjectMatch: 'chem',
    topicMatch: 'stoichiometry|mole|concentration|titration|empirical|percentage yield',
    flashcards: [
      {
        id: 'chm-sto-1',
        q: 'State the three core mole formulas for solids, gases, and solutions.',
        a: '1. Solids/Mass: Moles = Mass (g) / Mr\n2. Gases at r.t.p.: Moles = Volume (dm³) / 24\n3. Solutions: Moles = Concentration (mol/dm³) × Volume (dm³).'
      },
      {
        id: 'chm-sto-2',
        q: 'How do you convert cm³ to dm³ in titration calculations?',
        a: 'Divide cm³ by 1,000 (e.g. 25.0 cm³ = 0.025 dm³).'
      },
      {
        id: 'chm-sto-3',
        q: 'What is the formula for Percentage Yield and Percentage Purity?',
        a: '% Yield = (Actual Yield / Theoretical Yield) × 100%\n% Purity = (Mass of Pure Product / Total Mass of Impure Sample) × 100%.'
      }
    ],
    cheatsheet: {
      key_formulae: [
        'Moles = Mass (g) ÷ Mr',
        'Gas Moles = Volume (dm³) ÷ 24 dm³ (at r.t.p.)',
        'Concentration (mol/dm³) = Moles ÷ Volume (dm³)',
        'Concentration (g/dm³) = Concentration (mol/dm³) × Mr'
      ],
      exam_rules: [
        'Convert all volumes from cm³ to dm³ before using c = n / V.',
        'Keep intermediate mole figures in calculator memory to avoid rounding errors in final answers.'
      ],
      common_pitfalls: [
        'Dividing by 24,000 instead of 24 when volume is in dm³.',
        'Using atomic number instead of mass number when calculating Mr.'
      ]
    }
  },

  // =========================================================================
  // CHEMISTRY — ACIDS, BASES, SALTS & REACTIONS
  // =========================================================================
  {
    subjectMatch: 'chem',
    topicMatch: 'acid|base|salt|ph|indicator|neutralisation|redox|rate|exothermic',
    flashcards: [
      {
        id: 'chm-acid-1',
        q: 'What is the difference between a strong acid and a weak acid?',
        a: 'A strong acid (e.g. HCl, H₂SO₄, HNO₃) completely dissociates/ionises into H⁺ ions in aqueous solution. A weak acid (e.g. CH₃COOH ethanoic acid) only partially dissociates.'
      },
      {
        id: 'chm-acid-2',
        q: 'State the products of the four general acid reactions.',
        a: '1. Acid + Metal → Salt + Hydrogen\n2. Acid + Base/Alkali → Salt + Water\n3. Acid + Carbonate → Salt + Water + Carbon Dioxide\n4. Acid + Ammonia → Ammonium Salt.'
      },
      {
        id: 'chm-acid-3',
        q: 'Define oxidation and reduction in terms of electrons and oxidation states (OIL RIG).',
        a: 'Oxidation Is Loss of electrons (increase in oxidation state).\nReduction Is Gain of electrons (decrease in oxidation state).'
      }
    ],
    cheatsheet: {
      key_formulae: [
        'Solubility Rules: All Nitrates, Sodium, Potassium, and Ammonium salts are SOLUBLE',
        'Insoluble: Silver & Lead Halides; Barium, Lead & Calcium Sulfates',
        'Bond Energy: ΔH = Energy of Bonds Broken (reactants) - Energy of Bonds Formed (products)',
        'Negative ΔH = Exothermic (releases heat); Positive ΔH = Endothermic (absorbs heat)'
      ],
      exam_rules: [
        'Include state symbols (s, l, g, aq) when required in balanced chemical equations.',
        'Testing for CO₂: Bubbles through limewater (turns milky/cloudy).'
      ],
      common_pitfalls: [
        'Confusing base (insoluble metal oxide/hydroxide) with alkali (soluble base producing OH⁻).',
        'Subtracting products from reactants instead of reactants minus products in bond energies.'
      ]
    }
  },

  // =========================================================================
  // BIOLOGY — CELLS, ENZYMES & NUTRITION
  // =========================================================================
  {
    subjectMatch: 'bio',
    topicMatch: 'cell|enzyme|osmosis|diffusion|photosynthesis|digestion|nutrition|transport',
    flashcards: [
      {
        id: 'bio-cell-1',
        q: 'Compare plant and animal cells.',
        a: 'Plant cells have a cellulose cell wall, large permanent central vacuole, and chloroplasts. Animal cells lack cell walls and chloroplasts and have only small temporary vacuoles.'
      },
      {
        id: 'bio-cell-2',
        q: 'Explain the effect of high temperature and extreme pH on enzyme activity.',
        a: 'Beyond optimum temperature or pH, bonds holding the active site break. The enzyme denatures — its active site changes shape permanently, so the substrate can no longer bind (lock and key mechanism fails).'
      },
      {
        id: 'bio-cell-3',
        q: 'State the word and balanced chemical equation for photosynthesis.',
        a: 'Carbon Dioxide + Water → Glucose + Oxygen\n6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ (in presence of light and chlorophyll).'
      },
      {
        id: 'bio-cell-4',
        q: 'Define osmosis in precise Cambridge syllabus terms.',
        a: 'The net movement of water molecules from a region of higher water potential to a region of lower water potential through a partially permeable membrane.'
      }
    ],
    cheatsheet: {
      key_formulae: [
        'Magnification: M = Image Size (I) ÷ Actual Size (A)  [I = A × M]',
        'Photosynthesis: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂',
        'Aerobic Respiration: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + 2830 kJ energy'
      ],
      exam_rules: [
        'Convert all measurements to same units (e.g. mm to μm: multiply by 1,000) before calculating magnification.',
        'Use the term "water potential", NOT "water concentration" in osmosis questions.',
        'Never say enzymes "die" — enzymes are proteins, they "denature".'
      ],
      common_pitfalls: [
        'Writing arteries always carry oxygenated blood — the Pulmonary Artery carries deoxygenated blood to the lungs.',
        'Confusing breathing (mechanical ventilation) with respiration (cellular chemical reaction releasing energy).'
      ]
    }
  },

  // =========================================================================
  // ACCOUNTING (IGCSE 0452 / O-Level 7707 / A-Level 9706)
  // =========================================================================
  {
    subjectMatch: 'accounting',
    topicMatch: 'accounting|ledger|balance sheet|trial balance|income statement|depreciation|accrual|ratio',
    flashcards: [
      {
        id: 'acc-1',
        q: 'State the fundamental Accounting Equation.',
        a: 'Assets = Capital (Owner\'s Equity) + Liabilities.\nOr: Capital = Assets - Liabilities.'
      },
      {
        id: 'acc-2',
        q: 'What is the double-entry rule for Assets, Expenses, Liabilities, and Income (DEAD CLIC)?',
        a: '• DEAD: Debit Increases: Expenses, Assets, Drawings.\n• CLIC: Credit Increases: Liabilities, Income, Capital.'
      },
      {
        id: 'acc-3',
        q: 'List four types of errors that do NOT affect the Trial Balance agreement.',
        a: '1. Error of Omission (transaction completely omitted)\n2. Error of Commission (correct amount posted to wrong account of same class)\n3. Error of Principle (wrong class, e.g. motor repairs debited to motor vehicles)\n4. Compensating Error (two independent errors cancel each other).'
      },
      {
        id: 'acc-4',
        q: 'Compare the Straight-Line and Reducing Balance methods of depreciation.',
        a: '• Straight-Line: Equal depreciation charge every year: (Cost - Residual Value) / Useful Life.\n• Reducing Balance: Fixed percentage applied to the Net Book Value (Cost - Accumulated Depreciation), resulting in higher charge in earlier years.'
      }
    ],
    cheatsheet: {
      key_formulae: [
        'Gross Profit = Revenue - Cost of Sales (Opening Inventory + Purchases - Closing Inventory)',
        'Straight Line Depreciation = (Cost - Scrap Value) ÷ Useful Life',
        'Current Ratio = Current Assets ÷ Current Liabilities (ideal 1.5:1 to 2:1)',
        'Liquid Ratio (Acid Test) = (Current Assets - Inventory) ÷ Current Liabilities (ideal 1:1)',
        'Return on Capital Employed (ROCE) = (Operating Profit ÷ Capital Employed) × 100%'
      ],
      exam_rules: [
        'Always show ledger account dates, details, and balance carried down (c/d) and brought down (b/d).',
        'Clearly label whether balances are Debit or Credit in trial balance preparations.'
      ],
      common_pitfalls: [
        'Entering depreciation expense on the Statement of Financial Position instead of Accumulated Depreciation.',
        'Confusing carriage inwards (added to cost of purchases) with carriage outwards (selling expense).'
      ]
    }
  },

  // =========================================================================
  // ECONOMICS & BUSINESS STUDIES (0450 / 7115 / 0455 / 2281 / 9708)
  // =========================================================================
  {
    subjectMatch: 'economics|business',
    topicMatch: 'economic|business|market|demand|supply|elasticity|inflation|gdp|monetary|fiscal',
    flashcards: [
      {
        id: 'econ-1',
        q: 'Define the Basic Economic Problem and Opportunity Cost.',
        a: 'The basic economic problem is scarcity: unlimited human wants chasing finite, scarce resources. Opportunity cost is the next best alternative foregone when making a choice.'
      },
      {
        id: 'econ-2',
        q: 'How does Price Elasticity of Demand (PED) determine revenue changes when price rises?',
        a: '• Inelastic (PED < 1): Price rise increases total revenue (quantity demanded falls proportionally less).\n• Elastic (PED > 1): Price rise decreases total revenue (quantity demanded falls proportionally more).'
      },
      {
        id: 'econ-3',
        q: 'What is the difference between Fiscal Policy and Monetary Policy?',
        a: 'Fiscal Policy uses government taxation and public expenditure to influence aggregate demand. Monetary Policy uses central bank interest rates and money supply to control inflation and economic growth.'
      }
    ],
    cheatsheet: {
      key_formulae: [
        'PED = % Change in Quantity Demanded ÷ % Change in Price',
        'PES = % Change in Quantity Supplied ÷ % Change in Price',
        'Break-even Output = Fixed Costs ÷ (Selling Price - Variable Cost per Unit)',
        'Margin of Safety = Actual Output - Break-even Output'
      ],
      exam_rules: [
        'Use "movement along curve" for price changes; use "shift of curve" for non-price factors.',
        'Structure evaluate/discuss questions with balanced two-sided arguments followed by a justified recommendation.'
      ],
      common_pitfalls: [
        'Saying a price increase shifts the demand curve (it causes a movement along the curve).',
        'Confusing production (total volume) with productivity (output per worker/input).'
      ]
    }
  },

  // =========================================================================
  // PAKISTAN STUDIES (O-Level 2059 / IGCSE 0448)
  // =========================================================================
  {
    subjectMatch: 'pakistan|history|geography',
    topicMatch: 'pakistan|movement|jinnah|sir syed|all-india|lahore|environment|climate|agriculture|river',
    flashcards: [
      {
        id: 'pak-1',
        q: 'What were the three key objectives of Sir Syed Ahmad Khan\'s Aligarh Movement?',
        a: '1. Re-establish good relations between the British and Muslim community.\n2. Encourage Muslims to acquire modern Western and scientific education.\n3. Keep Muslims away from active politics until they achieved educational advancement.'
      },
      {
        id: 'pak-2',
        q: 'Why was the Lahore Resolution (1940) a turning point in the Pakistan Movement?',
        a: 'It officially moved the Muslim League from seeking minority constitutional safeguards to demanding independent, sovereign Muslim states in the North-Western and Eastern zones of British India.'
      },
      {
        id: 'pak-3',
        q: 'Why is canal irrigation essential for agriculture in the Indus Plain?',
        a: 'Pakistan has an arid to semi-arid climate with erratic rainfall (monsoon is concentrated in July–August). The Indus Basin irrigation system supplies reliable water year-round for cash crops (cotton, wheat, sugarcane, rice).'
      }
    ],
    cheatsheet: {
      key_formulae: [
        'Key Dates: 1857 (War of Independence), 1906 (Muslim League formed), 1929 (14 Points), 1940 (Lahore Resolution), 1947 (14 August Independence)',
        'Monsoon Winds: Southwest Summer Monsoon (rain from Arabian Sea/Bay of Bengal) & Northeast Winter Monsoon',
        'Barrages: Sukkur, Guddu, Kotri on Indus regulating canal discharge'
      ],
      exam_rules: [
        'In 7-mark and 14-mark history questions, provide at least three distinct developed reasons with contextual evidence.',
        'In 14-mark questions, evaluate both given factors, followed by a clear, weighed conclusion.'
      ],
      common_pitfalls: [
        'Writing descriptive narratives without answering the "Why" in causal analysis questions.',
        'Confusing Kharif crops (summer sowing: cotton, rice) with Rabi crops (winter sowing: wheat, barley).'
      ]
    }
  },

  // =========================================================================
  // ISLAMIYAT (O-Level 2058 / IGCSE 0493)
  // =========================================================================
  {
    subjectMatch: 'islamiyat|islamic',
    topicMatch: 'islamiyat|quran|prophet|caliph|hadith|tawhid|pillar|salah|zakah|hajj',
    flashcards: [
      {
        id: 'isl-1',
        q: 'How was the Quran compiled during the Caliphates of Abu Bakr (RA) and Uthman (RA)?',
        a: '• Abu Bakr (RA): Prompted by Umar (RA) after 70 huffaz died at Yamama; Zayd ibn Thabit (RA) collected manuscripts into the first complete copy (Mushaf-e-Hafsa).\n• Uthman (RA): Hearing variations in pronunciation in distant provinces, ordered standardized copies from Hafsa\'s codex and distributed them to provincial capitals.'
      },
      {
        id: 'isl-2',
        q: 'What were the conditions and significance of the Treaty of Hudaibiyah (628 AD)?',
        a: 'Terms: 10-year peace; Muslims return without Umrah that year; runaway Quraish to be returned. Significance: Recognized Muslims as an equal political power, allowed peaceful propagation leading to mass conversions (Fath-e-Makkah followed 2 years later).'
      },
      {
        id: 'isl-3',
        q: 'What is the difference between Hadith-e-Nabawi and Hadith-e-Qudsi?',
        a: 'Hadith-e-Qudsi contains words where the Prophet relates a direct message from Allah in his own phrasing. Hadith-e-Nabawi contains the regular sayings, actions, and silent approvals (Taqreer) of the Prophet (PBUH).'
      }
    ],
    cheatsheet: {
      key_formulae: [
        'Articles of Faith (Iman): Tawhid (Oneness), Malaikah (Angels), Kutub (Books), Rusul (Prophets), Akhirah (Day of Judgment), Qadar (Divine Decree)',
        'Five Pillars of Islam: Shahadah, Salah, Zakah (2.5% on surplus wealth held for one lunar year above Nisab), Sawm, Hajj',
        'Four Rightly Guided Caliphs: Abu Bakr (632-634), Umar (634-644), Uthman (644-656), Ali (656-661)'
      ],
      exam_rules: [
        'Always quote relevant Quranic verses or Hadith in Part (a) 10-mark questions to attain Level 4 marks.',
        'Part (b) 4-mark questions require personal reflection on how Muslims today apply the historical or spiritual lesson.'
      ],
      common_pitfalls: [
        'Focusing purely on story narration rather than syllabus themes and significance.',
        'Omitting dates or specific companion names in battle accounts.'
      ]
    }
  },

  // =========================================================================
  // ENGLISH LANGUAGE & LITERATURE (1123 / 0500 / 0475 / 9093)
  // =========================================================================
  {
    subjectMatch: 'english',
    topicMatch: 'english|reading|writing|directed|summary|comprehension|essay|narrative|descriptive',
    flashcards: [
      {
        id: 'eng-1',
        q: 'How do you analyze "Writer\'s Effect" in Cambridge English examinations?',
        a: '1. Select 2-3 precise words or phrases from the text.\n2. State the literal meaning.\n3. Explain the connotative effect, mood, and sensory impression created.\n4. Explain how this reinforces the overall atmosphere or character.'
      },
      {
        id: 'eng-2',
        q: 'What are the rules for Summary Writing in Cambridge English (1123 / 0500)?',
        a: '• Identify 10-12 distinct content points directly addressing the task.\n• Use your OWN words (paraphrase rather than lifting lines).\n• Adhere strictly to the word count (usually 120–150 words).\n• Organize with smooth transition markers (Furthermore, In contrast, Consequently).'
      },
      {
        id: 'eng-3',
        q: 'What distinguishes a Descriptive piece from a Narrative piece?',
        a: '• Descriptive: Focuses on static observation, 5 senses (sight, sound, smell, touch, taste), atmospheric figurative language, with little to no linear plot.\n• Narrative: Focuses on character development, conflict, pacing, climax, and chronological progression.'
      }
    ],
    cheatsheet: {
      key_formulae: [
        'Directed Writing Formats: Formal Letter (addresses, formal salutation & sign-off), Speech (rhetorical address, engaging hooks), Report (headings, formal tone)',
        'Stylistic Devices: Metaphor, Simile, Personification, Alliteration, Onomatopoeia, Sensory Imagery',
        'Punctuation Variety: Semicolons (to link related independent clauses), Colons (to introduce lists/explanations), Dashes (for emphatic pauses)'
      ],
      exam_rules: [
        'In Summary Writing, NEVER include personal opinions, quotes, or examples not present in the original text.',
        'Vary sentence lengths — use short single-clause sentences for dramatic suspense.'
      ],
      common_pitfalls: [
        'Lifting whole sentences from the reading passage in summary or comprehension questions.',
        'Writing a full narrative story when the prompt specifically asks for descriptive writing.'
      ]
    }
  },

  // =========================================================================
  // URDU (O-Level 3247 / 3248 / IGCSE 0539)
  // =========================================================================
  {
    subjectMatch: 'urdu',
    topicMatch: 'urdu|فہم|تحریر|مضمون|شاعری|نثر|گرامر',
    flashcards: [
      {
        id: 'urd-1',
        q: 'اردو پرچہ دوم میں تفہیم عبارت (Comprehension) کا بنیادی اصول کیا ہے؟',
        a: 'عبارت کو غور سے پڑھ کر اپنے الفاظ میں جامع اور مدلل جواب لکھیں۔ عبارت کے جملے ہو بہو نقل (Lifting) کرنے سے گریز کریں۔'
      },
      {
        id: 'urd-2',
        q: 'ہدایت شدہ تحریر (Directed Writing) میں کن نکات کا خیال رکھنا ضروری ہے؟',
        a: 'سوال میں دیے گئے تمام ذیلی نکات کا احاطہ کریں، موزوں القاب و آداب کا استعمال کریں اور دی گئی لفظی حد (150 تا 200 الفاظ) کی سختی سے پابندی کریں۔'
      }
    ],
    cheatsheet: {
      key_formulae: [
        'تحریر کی اقسام: رسمی خط، مکالمہ نگاری، تقریر، رپورٹ، مضمون',
        'قواعد: تذکیر و تانیث، واحد جمع، محاورات کا بروقت اور درست استعمال',
        'امتحانی تقسیم: Part 1 (مضمون نویسی/خط)، Part 2 (تفہیم و ترجمہ)'
      ],
      exam_rules: [
        'املا کی غلطیوں اور غیر ضروری طوالت سے بچیں۔',
        'ہر ذیلی پیراگراف کے لیے نیا نکتہ اٹھائیں اور موزوں ربط کے الفاظ استعمال کریں۔'
      ],
      common_pitfalls: [
        'عبارت کے جملے بغیر اپنے الفاظ میں تبدیل کیے ہو بہو لکھ دینا۔',
        'خط میں رسمی اور غیر رسمی اسلوب کو آپس میں خلط ملط کرنا۔'
      ]
    }
  }
];

/**
 * Intelligent Dynamic Topic Synthesizer
 * Generates subject- and topic-specific flashcards and cheatsheet items
 * for ANY Cambridge lesson, unit, or topic in the syllabus database.
 */
function synthesizeTopicMaterial(
  subjectName: string,
  topicOrUnitTitle: string
): TopicStudyMaterial {
  const sName = subjectName || 'Cambridge Subject';
  const tTitle = topicOrUnitTitle || 'Core Curriculum Topic';

  return {
    subjectMatch: sName.toLowerCase(),
    topicMatch: tTitle.toLowerCase(),
    flashcards: [
      {
        id: `syn-${Math.random().toString(36).substring(2, 7)}`,
        q: `What is the core syllabus definition and purpose of "${tTitle}" in ${sName}?`,
        a: `In ${sName}, "${tTitle}" establishes the fundamental principles and theoretical framework required by Cambridge examiners. Candidates are expected to state precise technical definitions, explain key mechanisms, and cite accurate syllabus terminology.`
      },
      {
        id: `syn-${Math.random().toString(36).substring(2, 7)}`,
        q: `What are the key principles and operational steps when solving questions on "${tTitle}"?`,
        a: `1. Identify the given parameters and Cambridge command word (e.g. State, Explain, Calculate, Discuss).\n2. Apply the core formulas or laws governing "${tTitle}".\n3. Show clear step-by-step intermediate working with standard units.\n4. Verify final answer accuracy against expected realistic boundaries.`
      },
      {
        id: `syn-${Math.random().toString(36).substring(2, 7)}`,
        q: `How do Cambridge examiners allocate marks for "${tTitle}" exam questions?`,
        a: `Method marks (M marks) are awarded for selecting the correct formula and showing appropriate substitution. Accuracy marks (A marks) require the correct final value with correct units and significant figures. Independent marks (B marks) are awarded for accurate definitions and keywords.`
      },
      {
        id: `syn-${Math.random().toString(36).substring(2, 7)}`,
        q: `What is the most frequent student mistake made on "${tTitle}" in Cambridge past papers?`,
        a: `Candidates frequently lose marks by giving vague generalisations instead of subject-specific terminology, omitting intermediate calculation steps, or failing to directly address the command word specified in the prompt.`
      },
      {
        id: `syn-${Math.random().toString(36).substring(2, 7)}`,
        q: `How can you achieve top-band / Grade A* performance in "${tTitle}"?`,
        a: `Consistently use syllabus keywords, show complete structured working for every sub-part, highlight units and direction (if vector), and allocate time strictly proportional to the mark allocation (1 mark ≈ 1 minute).`
      }
    ],
    cheatsheet: {
      key_formulae: [
        `Core Principles: Cambridge ${sName} Syllabus Specifications for ${tTitle}`,
        `Working Standard: Clearly state formula, substitute values, state final answer with units`,
        `Mark Allocation: Check total marks to determine required distinct points (e.g. 3 marks = 3 key points)`,
        `Time Guideline: Allocate approximately 1 to 1.2 minutes per mark`
      ],
      exam_rules: [
        `Highlight Cambridge command words: "State" (brief recall), "Describe" (what happens), "Explain" (why/how it happens).`,
        `Always show intermediate working on the question paper — do not perform steps purely on scrap paper.`,
        `Give answers to 3 significant figures unless otherwise instructed by the examination paper.`
      ],
      common_pitfalls: [
        `Using colloquial terms instead of rigorous ${sName} vocabulary for ${tTitle}.`,
        `Rounding intermediate numbers prematurely, causing rounding discrepancies in the final answer.`,
        `Forgetting to state units or writing ambiguous abbreviations.`
      ],
      examiner_tips: [
        `Examiner reports for ${sName} emphasize that candidates who structure answers in numbered bullet points consistently score higher marks on ${tTitle}.`,
        `Always re-read the specific question prompt to ensure your final statement directly answers what was asked.`
      ]
    }
  };
}

/**
 * Main Resolver: Finds the best-matching curated study materials
 * based on subject name and unit/lesson topic title.
 * If no specific pattern matches, generates high-quality dynamic material.
 */
export function resolveCuratedStudyMaterial(
  subjectName: string,
  topicOrUnitTitle?: string
): TopicStudyMaterial {
  const subLower = (subjectName || '').toLowerCase();
  const topicLower = (topicOrUnitTitle || '').toLowerCase();

  // 1. Try matching both subject AND topic keywords
  for (const item of CURATED_TOPIC_MATERIALS) {
    const subRegex = new RegExp(item.subjectMatch, 'i');
    if (subRegex.test(subLower)) {
      if (item.topicMatch) {
        const topicRegex = new RegExp(item.topicMatch, 'i');
        if (topicRegex.test(topicLower)) {
          return item;
        }
      }
    }
  }

  // 2. Fallback to subject-level match if available
  for (const item of CURATED_TOPIC_MATERIALS) {
    const subRegex = new RegExp(item.subjectMatch, 'i');
    if (subRegex.test(subLower)) {
      return item;
    }
  }

  // 3. Intelligent Dynamic Synthesis tailored to this exact subject and topic
  return synthesizeTopicMaterial(subjectName, topicOrUnitTitle || '');
}
