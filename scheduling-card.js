import "https://unpkg.com/wired-card@2.1.0/lib/wired-card.js?module";
import {
  LitElement,
  html,
  css,
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

import { generalStyles } from "./general_styles.js";

import "./scheduler-card.js";

//import "https://unpkg.com/@material/web@1.0.0-pre.4/index.js?module"

//import "../ha-frontend/src/panels/lovelace/entity-rows/hui-input-datetime-entity-row"

class SchedulingCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      narrow: { type: Boolean },
      route: { type: Object },
      panel: { type: Object },
      HPMode: { type: Boolean },
      extData: { type: Object }
    };
  }

  SchedulingMode(){
    var state = this.shadowRoot.getElementById("sch_mode_switch").checked;

    if(state){
        this.shadowRoot.getElementById("scheduling_title").innerText = "Scheduling OFF state: ";
        this.shadowRoot.getElementById("sch_off_card").style.display = "block";
        this.shadowRoot.getElementById("sch_on_card").style.display = "none";
    } else {
        this.shadowRoot.getElementById("scheduling_title").innerText = "Scheduling ON state: ";
        this.shadowRoot.getElementById("sch_on_card").style.display = "block";
        this.shadowRoot.getElementById("sch_off_card").style.display = "none";
    }
  }

  save(){
    this.data.offScheduling = this.shadowRoot.getElementById("sch_off_card").save();
    this.data.onScheduling = this.shadowRoot.getElementById("sch_on_card").save();
    return this.data;
  }

  setSchedModeOFF(){
    var btn = this.shadowRoot.getElementById("sch_mode_switch");
    if(btn.checked){
      btn.click();
    }
  }

  setData(){
    this.setSchedModeOFF();
    ["off", "on"].map((i) =>
      this.shadowRoot.getElementById("sch_" + i + "_card").setData()
    );
  }

  resetData(){
    this.setData();
  }

  render() {
    this.data = {
      "onScheduling" : {},
      "offScheduling" : {}
    }

    this.sel_vals = ["pizza", "pasta", "mandolino"];

    return html`
        <ha-card class="Scheduling">
            <div class="SingleEntry" id="sch_mode_sel">
                <div class="description" id="scheduling_title"> Scheduling OFF state : </div>
                <div class="sch_mode_switch"> <ha-switch id="sch_mode_switch" @click=${this.SchedulingMode}></ha-switch> </div> <!--ha-control-switch-->
            </div>
            <scheduler-card .hass=${this.hass} id="sch_off_card" class="sch_off_card" .mode=${"OFF"} .HPMode=${this.HPMode} .extData=${this.extData.OFF}></scheduler-card>
            <scheduler-card .hass=${this.hass} id="sch_on_card" class="sch_on_card" .mode=${"ON"} .HPMode=${this.HPMode} .extData=${this.extData.ON}></scheduler-card>
        </ha-card>
    `;
  }

  static style = [
    generalStyles,
    css`
      .sch_mode_switch{
        width: 100px;
        margin-left: auto;
      }

      .sch_on_card{
        display: none;
      }
    `
  ]

  static get styles() {
    return this.style;
  }
}
customElements.define("scheduling-card", SchedulingCard);