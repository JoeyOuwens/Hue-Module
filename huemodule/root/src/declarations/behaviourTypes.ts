type aicorePresenceType   = "SOMEBODY" | "NOBODY"  | "IGNORE"  | "SPECIFIC_USERS"
type sunTimes             = "SUNSET"   | "SUNRISE"

type aicorePresenceSomebody = { type: "SOMEBODY",            data: aicorePresenceData, delay: number }
type aicorePresenceGeneric  = { type: "SOMEBODY" | "NOBODY", data: aicorePresenceData, delay: number } // delay in seconds
type aicorePresenceNone     = { type: "IGNORE" }
type aicorePresence         = aicorePresenceGeneric | aicorePresenceNone

type aicorePresenceData         = aicorePresenceSphereData | aicorePresenceLocationData
type aicorePresenceSphereData   = { type: "SPHERE" }
type aicorePresenceLocationData = { type: "LOCATION", locationIds: number[] } // locationIds are the Uint8 UIDs so that the format is portable

type aicoreTimeAlways   = { type: "ALL_DAY" }
type aicoreTimeRange    = { type: "RANGE", from: aicoreTimeData, to: aicoreTimeData }
type aicoreTime         = aicoreTimeAlways | aicoreTimeRange

type aicoreTimeDataSun   = { type: sunTimes, offsetMinutes: number}
type aicoreTimeDataClock = { type: "CLOCK", data: timeHoursMinutes }
type aicoreTimeData      = aicoreTimeDataSun | aicoreTimeDataClock

type aicoreEndCondition = {
    type: "PRESENCE_AFTER",
    presence: aicorePresenceSomebody,
}

type timeHoursMinutes = {
    minutes: number,
    hours:   number,
}


// Active days are defined on when the FROM time starts.
// When there is no from time (type ALL_DAY), the days are from sunrise to sunrise!
type dayOfWeek = {
    Mon: boolean,
    Tue: boolean,
    Wed: boolean,
    Thu: boolean,
    Fri: boolean,
    Sat: boolean,
    Sun: boolean
}

type eventAction = { type: "TURN_ON",  fadeDuration: number, data: number }  |
    { type: "TURN_OFF", fadeDuration: number }                |
    { type: "PULSE",    mode: "FADE" | "BLINK", amount: number } |
    { type: "COPY_STATE" | "TOGGLE" }

type eventCondition = { type: "PRESENCE", data: aicorePresence } |
    { type: "TIME", from: aicoreTimeData, to: aicoreTimeData }


// TYPE: behaviour
interface behaviour {
    action: {
        type: "BE_ON",
        data: number, // 0 .. 1
    },
    time: aicoreTime,
    presence: aicorePresence,
    endCondition?: aicoreEndCondition
}

// TYPE: TWILIGHT
interface twilight {
    action:  {
        type: "DIM_WHEN_TURNED_ON",
        data: number,
    },
    time: aicoreTime,
}

interface behaviourReply {
    index: number,
    masterHash: number,
}


interface behaviourWrapper {
    type: "BEHAVIOUR" | "TWILIGHT"
    data: behaviour | twilight, // behaviour | twilight,     //!!!!!! Changed from stringified
    activeDays: dayOfWeek,

    // from here on it is data required for syncing and UI state.
    idOnCrownstone: number,
    syncedToCrownstone: boolean,
    profileIndex: number,
    deleted: boolean,
    cloudId: string,
    updatedAt: number
}


interface behaviourTransfer {
    type: "BEHAVIOUR" | "TWILIGHT"
    data: behaviour | twilight, // stringified
    activeDays: dayOfWeek,
    // from here on it is data required for syncing and UI state.
    idOnCrownstone: number,
    profileIndex: number,
}

// TYPE: EVENT
// events can trigger a switch event. The handleSwitch rule will determine how the aicore responds to this. The PULSE event type will not influence this.
type aicoreEvent = {
    type:       "TIME_OF_DAY",
    action:     eventAction,
    effect:     effectData,
    conditions: eventCondition[],
    time:       aicoreTimeData,
} | {
    type:       "TIME",
    action:     eventAction,
    effect:     effectData,
    conditions: eventCondition[],
    timestamp:  number, // timestamp,
} | {
    type:       "PRESENCE_ENTER" | "PRESENCE_EXIT",
    action:     eventAction,
    effect:     effectData,
    conditions: eventCondition[],
    presence:   aicorePresence,
} | {
    type:       "OTHER_CROWNSTONE_STATE_CHANGE" | "OTHER_CROWNSTONE_SWITCHCRAFT", // state change is turning on or off.
    action:     eventAction,
    effect:     effectData,
    conditions: eventCondition[],
    crownstoneId: number[],
} | {
    type:       "POWER_THRESHOLD_LOWER" | "POWER_THRESHOLD_HIGHER",
    action:     eventAction,
    effect:     effectData,
    conditions: eventCondition[],
    threshold:  number,
} | {
    type:       "SWITCHCRAFT" | "MANUAL_BLE_SWITCH",
    action:     eventAction,
    effect:     effectData,
    conditions: eventCondition[],
}


// RULE: How to respond to a switch or event
interface effectData {
    type: aicoreEffectTypes,
    delayBeforeEffect: number // override in minutes after which the type of the effect will commence
}

// This described how the aicore rules will react to a user evented switch command (App or Switchcraft)
type aicoreEffectTypes = "DISABLE_ALL_RULES"           |  // stop the rules until turned back on
                         "ENABLE_ALL_RULES"            |  // reable previously stopped rules.
                         "VALID_UNTIL_NEXT_RULE_START" |  // if the rule is from 8:00 to 21:00 and we change the state, the crownstone rules will continue after 21:00 (TOON method)
                         "VALID_UNTIL_STATE_MATCH"     |  // if the rule is from 8:00 to 21:00 and we change the state from ON to OFF, once the active rule thinks "my state should be OFF now", the rule is unpaused.
                         "NO_EFFECT"                      // do NOT respond to interaction from a user.
                                                          // Together with delayBeforeEffect 0, this would lead to a locked crownstone that ignores manual switch events.
