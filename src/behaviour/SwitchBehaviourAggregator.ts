import {SwitchBehaviour} from "./behaviour/SwitchBehaviour";
import {SphereLocation} from "../declarations/declarations";
import {BehaviourAggregatorUtil, POLLING_RATE} from "./BehaviourAggregatorUtil";
import {AggregatorBase} from "./AggregatorBase";
import {HueBehaviourWrapper} from "../declarations/behaviourTypes";


export class SwitchBehaviourAggregator extends AggregatorBase {
  behaviours: SwitchBehaviour[] = [];
  prioritizedBehaviour: SwitchBehaviour = undefined;

  cleanup(): void {
    this.stopLoop();
    for (const behaviour of this.behaviours) {
      behaviour.cleanup();
    }
  }



  addBehaviour(behaviour: HueBehaviourWrapper, sphereLocation: SphereLocation): void {
    this.behaviours.push(new SwitchBehaviour(behaviour, sphereLocation));
  }

  removeBehaviour(cloudId: string): void {
    for (let i = 0; i < this.behaviours.length; i++) {
      if (this.behaviours[i].behaviour.cloudId === cloudId) {
        this.behaviours[i].cleanup();
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
        if (behaviour.behaviour.type === "BEHAVIOUR") {
          activeBehaviours.push(behaviour);
        }
      }
    });
    this.prioritizedBehaviour = BehaviourAggregatorUtil.getPrioritizedBehaviour(activeBehaviours);
    this.composedState = (this.prioritizedBehaviour !== undefined) ? this.prioritizedBehaviour.getComposedState() : {on: false};
  }
}
