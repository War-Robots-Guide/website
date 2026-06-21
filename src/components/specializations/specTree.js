export const specTree = {
  question: "What are you picking a specialization for?",
  options: [
    {
      label: "Robot",
      value: "robot",
      next: {
        question: "What specialization is available on the robot?",
        options: [
          {
            label: "Damage Dealer / Raider",
            value: "damage_dealer",
            next: {
              question: "Select your specialization:",
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
                  label: "Raider",
                  value: "Raider",
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
              question: "Select your specialization:",
              options: [
                {
                  label: "Brawler",
                  value: "brawler",
                  next: {
                    question: "Choose your primary focus:",
                    options: [
                      {
                        label: "Survivalist (General brawler)",
                        value: "survivalist",
                        result: {
                          slots: [
                            { name: "Slot 1: Repair Amplifier" },
                            { name: "Slot 2: Immune Amplifier" }
                          ]
                        }
                      },
                      {
                        label: "Objective Stall (Titan charging)",
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
                  label: "Tank",
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
            label: "Support",
            value: "support",
            result: {
              slots: [
                { name: "Slot 1: Accelerator" },
                { name: "Slot 2: Last Stand" }
              ]
            }
          },
          {
            label: "Beacon Capping Saboteur",
            value: "saboteur_capper",
            result: {
              slots: [
                { name: "Slot 1: Beacon Operator" },
                { name: "Slot 2: Accelerator" }
              ]
            }
          },
          {
            label: "Non-Beacon Capping Saboteur",
            value: "saboteur_other",
            next: {
              question: "What is your tactical focus?",
              options: [
                {
                  label: "Attack-focused",
                  value: "attack",
                  result: {
                    slots: [
                      { name: "Slot 1: Thermonuke / Piercer" },
                      { name: "Slot 2: Thermonuke / Piercer" }
                    ]
                  }
                },
                {
                  label: "Defense-focused",
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
        question: "Is it an Ultimate Titan?",
        options: [
          {
            label: "Yes",
            value: "titan_ue_yes",
            result: {
              slots: [
                { name: "Slot 1: anything works" },
                { name: "Slot 2: anything but Grand Balanced Reactor" }
              ]
            }
          },
          {
            label: "No",
            value: "titan_ue_no",
            next: {
              question: "What specialization is available on the Titan?",
              options: [
                {
                  label: "Damage Dealer",
                  value: "titan_damage",
                  next: {
                    question: "Select your Build Focus:",
                    options: [
                      {
                        label: "Standard",
                        value: "standard",
                        result: {
                          slots: [
                            { name: "Slot 1: Nuclear Amplifier" },
                            { name: "Slot 2: Overdrive" }
                          ]
                        }
                      },
                      {
                        label: "Sniper",
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
                  label: "Brawler / Tank",
                  value: "titan_brawler_tank",
                  next: {
                    question: "Select your specialization:",
                    options: [
                      {
                        label: "Brawler",
                        value: "brawler",
                        result: {
                          slots: [
                            { name: "Slot 1: Repair Amplifier" },
                            { name: "Slot 2: Anticontrol" }
                          ]
                        }
                      },
                      {
                        label: "Tank",
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
                  label: "Attack",
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
                }
              ]
            }
          }
        ]
      }
    }
  ]
};
