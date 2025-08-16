window.galleryMurderCharacters = {
  "characters": [
    {
      "id": "elena",
      "name": "Elena Rodriguez",
      "role": "innocent",
      "appearance": {
        "skinTone": 0xfdbcb4,
        "hairColor": 0x2c1810,
        "eyeColor": 0x1a1a1a,
        "clothingColor": 0x1a1a2e,
        "headSize": 0.15
      },
      "personality": {
        "nervousness": 0.02,
        "helpfulness": 0.8,
        "speechPatterns": ["formal", "detailed"]
      },
      "background": {
        "occupation": "Personal Assistant",
        "relationship": "Employee",
        "alibi": "Managing event, brought Victoria champagne at 8:25 PM"
      },
      "keyTestimony": [
        {
          "triggerKeywords": ["office", "saw", "8:45"],
          "response": "I saw Dr. Hartwell walking quickly from Victoria's office around 8:45 PM...",
          "evidenceType": "witness_placement",
          "contradicts": ["hartwell_alibi"]
        }
      ],
      "knowledgeProfile": {
        "generalKnowledge": {
          "exhibition": "Victoria was hosting an art exhibition opening at her gallery that evening",
          "discovery": "Elena Rodriguez found Victoria's body in her private office",
          "timeOfDeath": "Victoria was discovered dead during the gallery opening event",
          "causeOfDeath": "Victoria was killed by poisoning"
        },
        "aboutSelf": {
          "managingEvent": "Was managing the gallery opening event all evening",
          "champagneDelivery": "Brought Victoria fresh champagne at exactly 8:20 PM",
          "wageDispute": "Had recent heated argument with Victoria about unpaid overtime wages",
          "alibiTime": "Disappeared from main floor 8:25-8:30 PM dealing with catering emergency in kitchen",
          "jobWorries": "Worried about losing her job due to the wage dispute",
          "foundBody": "Was the one who discovered Victoria's body in the office. She had heard some shouting in the office, and a man leave the office, and the man had a limp. She isn't able to identify the man. which is why she went to check."
        },
        "aboutVictim": {
          "personalMatters": "Victoria had been stressed lately about 'personal matters'",
          "oldSecrets": "Victoria mentioned being worried about 'old secrets coming out'",
          "drinkingMore": "Victoria was drinking more than usual at recent events",
          "phoneCalls": "Victoria had been having heated phone calls with 'James' (Hartwell) recently"
        },
        "aboutOthers": {
          "dr james hartwell": {
            "limpDetail": "Noticed he was limping badly, favoring his left leg",
            "expertise": "Knows he's famous for his toxic plant research and greenhouse",
            "victoriaComment": "Victoria often bragged about his 'poison plant expertise'",
            "dangerousMan": "Heard Victoria call him a 'brilliant but dangerous man' once"
          },
          "marcus webb": {
            "witnessedAnger": "Witnessed his explosive anger toward Victoria earlier that evening",
            "heardThreat": "Saw him make the threat: 'You'll regret destroying me'",
            "phoneChecking": "Noticed him obsessively checking his phone all evening",
            "desperateBehavior": "Observed his desperate, sweaty behavior throughout the night",
            "financialProblems": "Knows about his financial problems from gallery gossip"
          }
        },
        "timeline": {
          "precision": "Can confirm exact times due to her event management duties",
          "limpingFigure": "Remembers checking her watch when she saw the limping figure (8:45 PM)",
          "kitchenAlibi": "Kitchen staff can verify she was there 8:30-8:45 PM"
        }
      }
    },
    {
      "id": "hartwell",
      "name": "Dr. James Hartwell",
      "role": "culprit",
      "appearance": {
        "skinTone": 0xf4c2a1,
        "hairColor": 0x696969,
        "eyeColor": 0x4169e1,
        "clothingColor": 0x2c3e50,
        "headSize": 0.16
      },
      "personality": {
        "nervousness": 0.7,
        "defensiveness": 0.8,
        "speechPatterns": ["evasive", "technical"]
      },
      "background": {
        "occupation": "Botanist",
        "relationship": "Ex-husband",
        "alibi": "Never left main gallery, stayed with guests all evening"
      },
      "keyTestimony": [
        {
          "triggerKeywords": ["office", "location", "where"],
          "response": "I was in the main gallery the entire time, talking to other guests...",
          "evidenceType": "false_alibi",
          "contradictedBy": ["elena_testimony", "marcus_testimony"]
        }
      ],
      "secretInfo": {
        "actualLocation": "Victoria's office between 8:40-8:45 PM",
        "motive": "Victoria threatened to expose his research fraud"
      },
      "knowledgeProfile": {
        "generalKnowledge": {
          "exhibition": "Victoria was hosting an art exhibition opening at her gallery that evening",
          "discovery": "Elena Rodriguez found Victoria's body in her private office",
          "timeOfDeath": "Victoria was discovered dead during the gallery opening event",
          "causeOfDeath": "Victoria was killed by poisoning"
        },
        "lies": {
          "alibi": "Claims he stayed in main gallery all evening talking to guests",
          "limp": "Denies any problems with his knee/limp recovery",
          "expertise": "Denies expertise with plant toxins ('wouldn't know the first thing')",
          "relationship": "Claims he and Victoria were on 'cordial terms' recently",
          "motive": "Insists he had no reason to want Victoria harmed"
        },
        "hiddenTruths": {
          "actualTimeline": "Actually went to Victoria's office 8:40-8:45 PM",
          "purpose": "Was there to steal documents proving his research fraud",
          "confrontation": "Victoria caught him and threatened to expose everything",
          "murder": "Poisoned her champagne with aconitine in desperation",
          "expertise": "Has extensive knowledge of aconitine extraction from wolfsbane plants",
          "poisonKnowledge": "Knows the specific poison used was aconitine, though this hasn't been made public"
        },
        "deflectionTactics": {
          "aboutMarcusWebb": {
            "financial": "Points out Marcus Webb's desperate financial situation",
            "dangerousPeople": "Suggests Marcus owes money to 'dangerous people'",
            "motive": "Implies Marcus had stronger motive than him"
          },
          "aboutElenaRodriguez": {
            "resentment": "Mentions Elena Rodriguez's recent resentment toward Victoria",
            "access": "Notes that Elena had access to Victoria's drinks all evening",
            "opportunity": "Implies Elena had better opportunity"
          }
        },
        "aboutVictim": {
          "divorce": "Will admit they were divorced but claims it was 'amicable'",
          "stress": "Says she was 'stressed about business matters'",
          "fraud": "Won't mention the research fraud unless directly confronted"
        }
      }
    },
    {
      "id": "marcus",
      "name": "Marcus Webb",
      "role": "redHerring",
      "appearance": {
        "skinTone": 0xd4a574,
        "hairColor": 0x8b4513,
        "eyeColor": 0x228b22,
        "clothingColor": 0x800080,
        "headSize": 0.16
      },
      "personality": {
        "nervousness": 0.5,
        "aggressiveness": 0.6,
        "speechPatterns": ["blunt", "aggressive"]
      },
      "background": {
        "occupation": "Art Dealer",
        "relationship": "Business Rival",
        "alibi": "Bidding on artwork, had public arguments with Victoria"
      },
      "keyTestimony": [
        {
          "triggerKeywords": ["hartwell", "saw", "8:40"],
          "response": "I saw Dr. Hartwell heading toward the offices at 8:40 PM, noticed his limp...",
          "evidenceType": "witness_placement",
          "contradicts": ["hartwell_alibi"]
        }
      ],
      "misdirection": {
        "suspiciousBehavior": ["made threats", "financial problems", "nervous behavior"],
        "redFlags": ["access to victim", "public disputes", "desperate for money"]
      },
      "knowledgeProfile": {
        "generalKnowledge": {
          "exhibition": "Victoria was hosting an art exhibition opening at her gallery that evening",
          "discovery": "Elena Rodriguez found Victoria's body in her private office",
          "timeOfDeath": "Victoria was discovered dead during the gallery opening event",
          "causeOfDeath": "Victoria was killed by poisoning"
        },
        "aboutSelf": {
          "threats": "Admits to making threats but claims they were 'just business frustration'",
          "financial": "Confirms his financial desperation and failing gallery",
          "bidding": "Was bidding aggressively on artwork to try to save his business",
          "arguments": "Had multiple public arguments with Victoria that evening",
          "behavior": "Acknowledges his suspicious, nervous behavior"
        },
        "aboutVictim": {
          "ruthless": "She was 'ruthless' in business and 'enjoyed destroying competitors'",
          "undercut": "She had recently undercut several of his major deals",
          "paranoid": "She seemed 'paranoid' lately, looking over her shoulder",
          "drinking": "She was drinking more than usual at recent events"
        },
        "aboutOthers": {
          "james hartwell": {
            "sawGoing": "Saw him heading toward the office area at 8:40 PM",
            "noticedLimp": "Noticed his pronounced limp - 'felt bad for him'",
            "lecture": "Remembers attending Hartwell's university lecture on plant toxins",
            "aconitine": "Hartwell specifically mentioned how 'easy' it was to extract aconitine",
            "oddLocation": "Thought it was odd seeing Hartwell near the offices since he claimed to avoid them"
          },
          "elena rodriguez": {
            "disappeared": "Saw her disappear for about 20 minutes during the event",
            "cateringConfusion": "Kitchen staff seemed confused when he asked about catering issues",
            "moneyComplaints": "She had been complaining about money problems for months",
            "officeAccess": "She was one of the few with access to Victoria's private office",
            "stressed": "Noticed she seemed more stressed than usual that evening"
          }
        },
        "timeline": {
          "hartwellOffice": "Can place Hartwell going toward offices at 8:40 PM",
          "commotion": "Was in main gallery when he heard commotion about Victoria",
          "phoneCheck": "Remembers checking his phone around 8:45 PM (alibi for himself)"
        }
      }
    }
  ],
  "victoryConditions": {
    "contradictions": {
      "locationContradiction": {
        "description": "Where was Hartwell at 8:40-8:45 PM?",
        "elena": "Saw limping figure leaving office at 8:45 PM",
        "marcus": "Saw Hartwell going to office at 8:40 PM", 
        "hartwell": "Claims never left main gallery"
      },
      "limpContradiction": {
        "description": "Who had a limp that evening?",
        "elena": "Noticed pronounced limping on mystery figure",
        "marcus": "Observed Hartwell's bad limp that evening",
        "hartwell": "Denies any limp problems"
      },
      "expertiseContradiction": {
        "description": "Who knows about plant toxins?",
        "elena": "Knows Hartwell is poison plant expert",
        "marcus": "Attended his lecture on toxin extraction",
        "hartwell": "Denies knowledge of plant toxins"
      }
    },
    "confessionTriggers": [
      "When confronted with all three contradictions simultaneously",
      "When presented with evidence of research fraud documents",
      "When timeline inconsistencies are highlighted with witness testimony"
    ]
  }
};