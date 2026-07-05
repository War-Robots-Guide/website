export const specTree = {
  question: "What are you picking a specialization for?",
  options: [
    {
      label: "Robot",
      value: "robot",
      next: {
        question: "What specialization/playstyle does your robot fall under?",
        options: [
          {
            label: "Damage Dealer / Raider",
            value: "damage_dealer",
            next: {
              question: "Select your niche:",
              options: [
                {
                  label: ">800m damage dealer (Sniper)",
                  value: "long_range",
                  result: {
                    specialization: "Damage Dealer / Raider",
                    slots: [
                      { name: "Slot 1: Nuclear Amplifier" },
                      { name: "Slot 2: Rangefinder" }
                    ]
                  }
                },
                {
                  label: "<800m damage dealer (Assault)",
                  value: "standard_range",
                  result: {
                    specialization: "Damage Dealer / Raider",
                    slots: [
                      { name: "Slot 1: Nuclear Amplifier" },
                      { name: "Slot 2: Overdrive Unit" }
                    ]
                  }
                },
                {
                  label: "Raider (with powerful built in weapon)",
                  value: "raider_with_weapon",
                  result: {
                    specialization: "Damage Dealer / Raider",
                    slots: [
                      { name: "Slot 1: Nuclear Amplifier" },
                      { name: "Slot 2: Integrated Power Unit" }
                    ]
                  }
                },
                {
                  label: "Raider (without powerful built in weapon)",
                  value: "raider_without_weapon",
                  result: {
                    specialization: "Damage Dealer / Raider",
                    slots: [
                      { name: "Slot 1: Nuclear Amplifier" },
                      { name: "Slot 2: Titan Slayer" }
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
                    question: "Select your niche:",
                    options: [
                      {
                        label: "Survivalist or DoT Converter",
                        value: "survivalist_dot",
                        result: {
                          specialization: "Brawler / Tank",
                          slots: [
                            { name: "Slot 1: Repair Amplifier" },
                            { name: "Slot 2: Immune Amplifier" }
                          ]
                        }
                      },
                      {
                        label: "Titan charger",
                        value: "titan_charger",
                        result: {
                          specialization: "Brawler / Tank",
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
                    specialization: "Brawler / Tank",
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
              specialization: "Support",
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
              specialization: "Saboteur",
              slots: [
                { name: "Slot 1: Beacon Operator" },
                { name: "Slot 2: Accelerator" }
              ]
            }
          },
          {
            label: "Non-Capping Saboteur",
            value: "saboteur_other",
            result: {
              specialization: "Attack / Defense",
              slots: [
                { name: "Slot 1: Anticontrol" },
                { name: "Slot 2: Heavy Armor Kit" }
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
            label: "Ultimate Titan",
            value: "titan_ue_yes",
            result: {
              specialization: "Ultimate",
              slots: [
                { name: "Slot 1: anything works" },
                { name: "Slot 2: anything but Grand Balanced Reactor" }
              ]
            }
          },
          {
            label: "Not Ultimate",
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
                          specialization: "Damage Dealer",
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
                          specialization: "Damage Dealer",
                          slots: [
                            { name: "Slot 1: Nuclear Amplifier" },
                            { name: "Slot 2: Cannibal Reactor" }
                          ]
                        }
                      },
                      {
                        label: "Anti Stealth",
                        value: "titan_anti_stealth",
                        result: {
                          specialization: "Attack",
                          slots: [
                            { name: "Slot 1: Onslaught Reactor" },
                            { name: "Slot 2: Quantum Sensor" }
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
                          specialization: "Brawler / Tank",
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
                          specialization: "Brawler / Tank",
                          slots: [
                            { name: "Slot 1: Repair Amplifier" },
                            { name: "Slot 2: Last Stand" }
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
      }
    }
  ]
};
