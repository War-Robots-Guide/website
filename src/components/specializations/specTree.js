export const specTree = {
  question: "What unit type are you picking a specialization for?",
  options: [
    {
      label: "Robot",
      value: "robot",
      next: {
        question: "Select your Robot Class/Role:",
        options: [
          {
            label: "Damage Dealer / Raider",
            value: "damage_dealer",
            next: {
              question: "Select your Build Type / Range Focus:",
              options: [
                {
                  label: ">800m damage dealer",
                  value: "long_range",
                  result: {
                    slots: [
                      { name: "Slot 1: Nuclear Amplifier" },
                      { name: "Slot 2: Rangefinder" }
                    ]
                  }
                },
                {
                  label: "<800m damage dealer",
                  value: "standard_range",
                  result: {
                    slots: [
                      { name: "Slot 1: Nuclear Amplifier" },
                      { name: "Slot 2: Overdrive Unit" }
                    ]
                  }
                },
                {
                  label: "raider",
                  value: "raider",
                  result: {
                    slots: [
                      { name: "Slot 1: Nuclear Amplifier" },
                      { name: "Slot 2: Power Unit / Titan Slayer" }
                    ]
                  }
                }
              ]
            }
          },
          {
            label: "Brawler / Tank",
            value: "brawler_tank",
            next: {
              question: "Choose your Robot Archetype:",
              options: [
                {
                  label: "Brawler (Active close-quarters combat)",
                  value: "brawler",
                  next: {
                    question: "Choose your primary playstyle focus:",
                    options: [
                      {
                        label: "Survivalist (Prolonged duels)",
                        value: "survivalist",
                        result: {
                          slots: [
                            { name: "Slot 1: Repair Amplifier" },
                            { name: "Slot 2: Immune Amplifier" }
                          ]
                        }
                      },
                      {
                        label: "Objective Stall (Hold beacons under focus fire)",
                        value: "stall",
                        result: {
                          slots: [
                            { name: "Slot 1: Repair Amplifier" },
                            { name: "Slot 2: Last Stand" }
                          ]
                        }
                      }
                    ]
                  }
                },
                {
                  label: "Tank (High raw durability & damage absorption)",
                  value: "tank",
                  result: {
                    slots: [
                      { name: "Slot 1: Heavy Armor Kit" },
                      { name: "Slot 2: Repair Amplifier" }
                    ]
                  }
                }
              ]
            }
          },
          {
            label: "Support (Healer / Buffer)",
            value: "support",
            result: {
              slots: [
                { name: "Slot 1: Accelerator" },
                { name: "Slot 2: Last Stand" }
              ]
            }
          },
          {
            label: "Saboteur / Beacon Capper",
            value: "saboteur_capper",
            result: {
              slots: [
                { name: "Slot 1: Beacon Operator" },
                { name: "Slot 2: Accelerator" }
              ]
            }
          },
          {
            label: "Other / Non-Capping Saboteur",
            value: "saboteur_other",
            next: {
              question: "What is your tactical focus?",
              options: [
                {
                  label: "Attack-focused (Raw burst damage)",
                  value: "attack",
                  result: {
                    slots: [
                      { name: "Slot 1: Thermonuke / Piercer" },
                      { name: "Slot 2: Thermonuke / Piercer" }
                    ]
                  }
                },
                {
                  label: "Defense-focused (Cleanse & Survival)",
                  value: "defense",
                  result: {
                    slots: [
                      { name: "Slot 1: Anticontrol" },
                      { name: "Slot 2: Heavy Armor Kit" }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    },
    {
      label: "Titan",
      value: "titan",
      next: {
        question: "Select your Titan Class/Role:",
        options: [
          {
            label: "Damage Dealer (Offense & Firepower)",
            value: "titan_damage",
            next: {
              question: "Select your Build Focus:",
              options: [
                {
                  label: "Standard/Mixed Combat",
                  value: "standard",
                  result: {
                    slots: [
                      { name: "Slot 1: Nuclear Amplifier" },
                      { name: "Slot 2: Overdrive" }
                    ]
                  }
                },
                {
                  label: "Sniper / Chip / Titan-Focus",
                  value: "sniper",
                  result: {
                    slots: [
                      { name: "Slot 1: Nuclear Amplifier" },
                      { name: "Slot 2: Cannibal Reactor" }
                    ]
                  }
                }
              ]
            }
          },
          {
            label: "Brawler / Tank (Frontline & Durability)",
            value: "titan_brawler_tank",
            next: {
              question: "Select your Titan Playstyle Archetype:",
              options: [
                {
                  label: "Brawler (Active frontline combat)",
                  value: "brawler",
                  result: {
                    slots: [
                      { name: "Slot 1: Repair Amplifier" },
                      { name: "Slot 2: Anticontrol" }
                    ]
                  }
                },
                {
                  label: "Tank (Objective hold & damage absorption)",
                  value: "tank",
                  result: {
                    slots: [
                      { name: "Slot 1: Repair Amplifier" },
                      { name: "Slot 2: Last Stand" }
                    ]
                  }
                }
              ]
            }
          },
          {
            label: "Attack (High Burst / Utility)",
            value: "titan_attack",
            result: {
              slots: [
                { name: "Slot 1: Onslaught Reactor" },
                { name: "Slot 2: Quantum Sensor" }
              ]
            }
          },
          {
            label: "Defense (AVOID - Focus on Passives Only)",
            value: "titan_defense",
            result: {
              slots: [
                { name: "AVOID SPECIALIZATION" }
              ]
            }
          },
          {
            label: "Ultimate (Highly Modular)",
            value: "titan_ultimate",
            next: {
              question: "Choose a build constraint rule:",
              options: [
                {
                  label: "General Build (Flexible configuration)",
                  value: "general",
                  result: {
                    slots: [
                      { name: "Slot 1: Highly Modular" }
                    ]
                  }
                },
                {
                  label: "Grand Balanced Reactor Constraint",
                  value: "gbr_constraint",
                  result: {
                    slots: [
                      { name: "Slot 1: Flexible Module" },
                      { name: "Slot 2: AVOID Grand Balanced Reactor" }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    }
  ]
};
