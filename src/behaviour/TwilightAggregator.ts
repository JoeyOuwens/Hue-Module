import {SphereLocation} from "../declarations/declarations";
import {BehaviourAggregatorUtil, POLLING_RATE} from "./BehaviourAggregatorUtil";
import {Twilight} from "./behaviour/Twilight";
import {AggregatorBase} from "./AggregatorBase";
import {HueBehaviourWrapper} from "../declarations/behaviourTypes";


export class TwilightAggregator extends AggregatorBase {
  behaviours: Twilight[] = [];
  prioritizedBehaviour: Twilight = undefined;


  addBehaviour(behaviour: HueBehaviourWrapper, sphereLocation: SphereLocation): void {
    this.behaviours.push(new Twilight(behaviour, sphereLocation));
  }

  removeBehaviour(cloudId: string): void {
    for (let i = 0; i < this.behaviours.length; i++) {
      if (this.behaviours[i].behaviour.cloudId === cloudId) {
        this.behaviours.splice(i, 1);
        break;
      }
    }
  }

  _prioritizeBehaviour() {
    if (this.behaviours === []) {
      this.prioritizedBehaviour = undefined;
    }

    let activeBehaviours = [];
    this.behaviours.forEach(behaviour => {
      if (behaviour.isActive) {
        if (behaviour.behaviour.type === "TWILIGHT") {
          activeBehaviours.push(behaviour);
        }
      }
    });
    this.prioritizedBehaviour = BehaviourAggregatorUtil.getPrioritizedTwilight(activeBehaviours);
    this.composedState = (this.prioritizedBehaviour !== undefined) ? this.prioritizedBehaviour.getComposedState() : {on: false};
  }

}
