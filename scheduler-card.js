import {
  LitElement,
  html,
  css,
} from "https://cdn.skypack.dev/lit-element@2.4.0/lit-element.js";

import { generalStyles } from "./general_styles.js";

//import "https://unpkg.com/@material/mwc-radio@0.27.0/mwc-radio.js?module"

import "https://cdn.skypack.dev/@material/web@1.0.0-pre.4/radio/radio.js";

//import "../ha-frontend/src/panels/lovelace/entity-rows/hui-input-datetime-entity-row"

class SchedulerCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      narrow: { type: Boolean },
      route: { type: Object },
      panel: { type: Object },      
      mode: { type: String },
      HPMode: {type: Boolean},
      extData: { type: Array },
      scheds: { type: Array }
    };
  }

  sel_vals = ["pizza", "pasta", "mandolino"];
  curr_val = null;

  En_End() {
    var state = !this.shadowRoot.getElementById("End_time_btn").checked;
    if (state) {
      this.shadowRoot.getElementById("end-time").disabled = false;
      this.shadowRoot.getElementById("end-date").disabled = false;
      this.data.enableEndSchedule = true;
    } else {
      this.shadowRoot.getElementById("end-time").disabled = true;
      this.shadowRoot.getElementById("end-date").disabled = true;
      this.data.enableEndSchedule = false;
    }

  }

  updated() {
    this.shadowRoot.getElementById("end-time").disabled = true;
  }

  _onScheduleSelected(ev) {
    this.del_sel = ev.target.value;
  }

  _onRadioSel(ev){
    this.repeat = ev.target.__value;
    if(this.repeat != "n"){
      this.shadowRoot.getElementById("repeat_days_input").disabled = true;
    } else {
      this.shadowRoot.getElementById("repeat_days_input").disabled = false;
    }    
  }

  signalError(msg){
    alert(msg);
    this.sendEvent("err_occ", true);
  }

  getSchedule(mode){
    var result = {
      "date" : null,
      "time" : null
    };

    var date = this.shadowRoot.getElementById(mode + "-date").value;
    result.date = (date != undefined) ? date : null;

    var time = this.shadowRoot.getElementById(mode + "-time").value;
    result.time = (time != undefined) ? time : null;

    return result;
  }

  sendEvent(event_name, event_msg){
    let Event = new CustomEvent(event_name, {
        detail: { message: event_msg },
        bubbles: true,
        composed: true 
    });
    this.dispatchEvent(Event);
  }

  resetValid(){
    this.shadowRoot.getElementById("repeat_days_input").invalid = false;
  }

  checkDateCons(){
    var start = this.data.startSchedule.date + " " + this.data.startSchedule.time;
    var end = this.data.endSchedule.date + " " + this.data.endSchedule.time;

    start = Date.parse(start);
    end = Date.parse(end);
    var now = Date.now();
    
    if(end < start){
      this.signalError("Schedule End date and time must be after Start one.")
    }

    if((end < now) | (start < now)){
      this.signalError("Schedule date and time must be in the future.")
    }
  }

  checkRepeatDaysCons(){
    if(this.data.repeat == "n"){
      var el = this.shadowRoot.getElementById("repeat_days_input");
      this.data.repeat = el.value;
      if(parseInt(this.data.repeat) < 0){
        this.signalError("Number of repeat days must be positive.")
        el.invalid = true;
      }
    }
    
    if(this.data.repeat == undefined){
      this.signalError("Number of repeat days must not be null.")
    }
  }

  save(){
    if(!this.HPMode){
      this.data.startSchedule = this.getSchedule("start");
      if(this.data.enableEndSchedule){
        this.data.endSchedule = this.getSchedule("end");

        this.checkDateCons();
      }
      
      if(this.data.startSchedule.date != null | this.data.startSchedule.time != null){
        this.data.repeat = this.repeat;

        this.checkRepeatDaysCons();

        this.data.repeat = parseInt(this.data.repeat);
      }
    } else {
      this.data.enableEndSchedule = false;
    }

    return this.data;
  }

  setEndSchedOFF(){
    var btn = this.shadowRoot.getElementById("End_time_btn");
    if(btn.checked){
      btn.click();
    }
  }

  resetSchedule(){
    var modes = ["start", "end"];
    for(let i=0; i<2; i++){
      this.shadowRoot.getElementById(modes[i] + "-date").value = null;
      this.shadowRoot.getElementById(modes[i] + "-time").value = null;
    }
  }

  resetRadio(){
    this.shadowRoot.getElementById("never_btn").click();
    this.shadowRoot.getElementById("repeat_days_input").value = "";
  }

  resetMode(){
    this.shadowRoot.getElementById("del_sched").value = "";
  }

  async setOldSchedules(){
    this.scheds = [];
    for(const sched of this.extData){
      this.scheds.push(sched["startSchedule"]+" - "+sched["endSchedule"]+" R: "+sched["repeat"]);
    }
    await this.render();
    await new Promise(r => setTimeout(r, 1));
  }

  setData(data = this.extData){
    this.extData = data;
    this.setOldSchedules();
    this.setEndSchedOFF();
    this.resetSchedule();
    this.resetRadio();
    this.resetMode();
  }

  resetData(){
    this.setData();
  }

  scheds = ["temp", "temp"];

  render() {
    return html`
        <div id="scheduler" class="scheduler">
            <div class="SingleEntry" id="start_time">
                <div class="description" id="start_time_label">Start :</div>
                <ha-date-input class="date-input" id="start-date" .locale="${this.hass.locale}"></ha-date-input>
                <ha-time-input id="start-time" .locale="${this.hass.locale}" .value="${this.hass.value}"></ha-time-input>
            </div>
            <div class="SingleEntry" id="end_time" style="padding-bottom: 7px;">
                <div class="description" id="end_time_label" style="width: 37.5px">End :</div>
                <ha-date-input class="date-input" id="end-date" .locale="${this.hass.locale}" disabled></ha-date-input>
                <ha-time-input id="end-time" .locale="${this.hass.locale}" .value="${this.hass.value}" disabled></ha-time-input>
                <div class="button_end_time_cont">
                    <ha-switch id="End_time_btn" @click="${this.En_End}"></ha-switch>
                </div>
            </div>
            <div class="SingleEntry" id="repeat_menu">
                <div class="description" id="repeat_label" style="padding-right:10px">Repeat :</div>
                <md-radio class="radio" id="never_btn" name="days_num" value="0" checked="checked" @click=${this._onRadioSel}></md-radio>
                <div class="radio-label" id="repeat_label">Never</div>
                <md-radio class="radio" name="days_num" value="1" @click=${this._onRadioSel}></md-radio>
                <div class="radio-label" id="repeat_label">Every Day</div>
                <md-radio class="radio" name="days_num" value="7" label="1 week" @click=${this._onRadioSel}></md-radio>
                <div class="radio-label" id="repeat_label">Every week</div>
                <md-radio class="radio" name="days_num" value="n" label="n days" @click=${this._onRadioSel}></md-radio>
                <div class="radio-label" id="repeat_label">Every</div>
                <ha-textfield id="repeat_days_input" class="repeat_days_input" label="n" @click=${this.resetValid} disabled></ha-textfield>
                <div class="radio-label" id="repeat_label">days</div>
            </div>
            <div class="SingleEntry" id="delete_schedule">
                <div class="description" id="delete_label">Delete schedule :</div>
                <ha-select id="del_sched" class="del_sched" label="${this.mode}" @selected=${this._onScheduleSelected}>
                  ${this.scheds.map((item) => html`<mwc-list-item .value=${item}>${item}</mwc-list-item>`)}
                </ha-select>
                <mwc-button class="del_button" label="Delete"></mwc-button>
            </div>
        </div>
    `;
  }

  static style = [
    generalStyles,
    css`
      .button_end_time_cont{
        display: flex;
        margin-left: 10px;
        flex-wrap: wrap;
        align-content: center;
      }
      
      .del_button{
        display: flex;
        margin-left: 5px;
        flex-wrap: wrap;
        align-content: center;
      }

      .date-input{
        margin-right: 5px;
      }

      .radio{
        height: 72px;
        width: 35px;
        --_selected-icon-color : var(--primary-color);
        --_selected-hover-icon-color : var(--primary-color);
        --_selected-focus-icon-color : var(--primary-color);
        --_selected-hover-state-layer-color : var(--primary-color);
        --_state-layer-size : 35px;
      }

      .radio-label{
        padding-right: 5px;
        margin-top: auto;
        margin-bottom: auto;
      }

      .repeat_days_input{
        width: 50px;
        padding-right: 5px;
      }

      .del_sched{
        width: 330px;
      }
    `
  ]

  static get styles() {
    return this.style;
  }
}
customElements.define("scheduler-card", SchedulerCard);