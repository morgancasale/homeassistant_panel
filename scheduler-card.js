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
      scheds: { type: Array }
    };
  }

  constructor(){
    super();
    this.data = {
      socketID : null,
      mode : "",
      startSchedule : "",
      enableEndSchedule : false,
      endSchedule : "",
      repeat : 0
    }
  }

  sel_vals = ["pizza", "pasta", "mandolino"];
  curr_val = null;

  En_End() {
    var state = !this.shadowRoot.getElementById("End_time_btn").checked;
    if (state) {
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
    var date = this.shadowRoot.getElementById(mode + "-date").value;
    date = (date != null) ? date : "";

    var time = "";
    if(date != ""){
      var time = this.shadowRoot.getElementById(mode + "-time").value;
      time = (time != null) ? " " + time : " 00:00";
    }
    return date+time;
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
    var start = Date.parse(this.data.startSchedule);
    var end = Date.parse(this.data.endSchedule);
    var now = Date.now();
    
    if(end < start){
      this.shadowRoot.getElementById("end-date").invalid = true;
      this.shadowRoot.getElementById("end-time").invalid = true;
      throw new Error("Schedule End date and time must be after Start one.");
    }

    if((end < now) | (start < now)){
      this.shadowRoot.getElementById("start-date").invalid = true;
      this.shadowRoot.getElementById("start-time").invalid = true;
      this.shadowRoot.getElementById("end-date").invalid = true;
      this.shadowRoot.getElementById("end-time").invalid = true;
      throw new Error("Schedule date and time must be in the future.");
    }

    var repeatMs = this.repeat * 24 * 60 * 60 * 1000;

    if((repeatMs != 0) & ((end-start) > (repeatMs))){
      this.shadowRoot.getElementById("repeat_days_input").invalid = true;
      throw new Error("Number of days before repeating the schedule must be greater than the schedule itself.")
    }
  }

  checkRepeatDaysCons(){
    if(this.data.repeat == "n"){
      var el = this.shadowRoot.getElementById("repeat_days_input");
      this.data.repeat = el.value;
      if(parseInt(this.data.repeat) < 0){
        el.invalid = true;
        throw new Error("Number of repeat days must be positive.")
      }
    
      if(this.data.repeat == 0){
        el.invalid = true;
        throw new Error("Number of repeat days must not be null.")
      }
    }
  }

  save(){
    if(!this.HPMode){
      this.data.startSchedule = this.getSchedule("start");
      
      if(this.data.startSchedule != ""){
        this.data.repeat = this.repeat;

        this.checkRepeatDaysCons();

        this.data.repeat = parseInt(this.data.repeat);
      }

      if(this.data.enableEndSchedule){
        this.data.endSchedule = this.getSchedule("end");

        this.checkDateCons();
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
    ["start", "end"].map((mode) => {
      this.shadowRoot.getElementById(mode + "-date").value = null;
      this.shadowRoot.getElementById(mode + "-time").value = null;
    });
  }

  resetRadio(){
    this.shadowRoot.getElementById("never_btn").click();
    this.shadowRoot.getElementById("repeat_days_input").value = "";
  }

  resetMode(){
    this.shadowRoot.getElementById("del_sched").value = "";
  }

  async reRender(){    
    await new Promise(r => setTimeout(r, 5));
    await this.render();
  }

  async setOldSchedules(data){
    this.scheds = [];
    for(const sched of data){
      this.scheds.push(sched["startSchedule"]+" - "+sched["endSchedule"]+" R: "+sched["repeat"]);
    }
    await this.reRender();
  }

  setData(data){
    this.setOldSchedules(data);
    this.setEndSchedOFF();
    this.resetSchedule();
    this.resetRadio();
    this.resetMode();
  }

  resetData(){
    this.setData();
  }

  scheds = ["temp", "temp"];

  EnTime(mode){
    if(this.shadowRoot.getElementById(mode+"-date").value != null){
      this.shadowRoot.getElementById(mode+"-time").disabled = false;
    } else {
      this.shadowRoot.getElementById(mode+"-time").disabled = true;
    }
  }

  delSchedule(){
    var selSched = this.shadowRoot.getElementById("del_sched").value;
  }

  render() {
    return html`
      <div id="scheduler" class="scheduler">
        <div class="SingleEntry" id="start_time">
          <div class="description" id="start_time_label">Start :</div>
          <ha-date-input class="date-input" id="start-date" .locale="${this.hass.locale}" @change=${()=>this.EnTime("start")}></ha-date-input>
          <ha-time-input id="start-time" .locale="${this.hass.locale}" .value="${this.hass.value}" disabled></ha-time-input>
          <mwc-button class="button" label="Clear" @click=${()=>{this.resetSchedule(); this.setEndSchedOFF()}}></mwc-button>
        </div>
        <div class="SingleEntry" id="end_time" style="padding-bottom: 7px;">
          <div class="description" id="end_time_label" style="width: 37.5px">End :</div>
          <ha-date-input class="date-input" id="end-date" .locale="${this.hass.locale}" @change=${()=>this.EnTime("end")} disabled></ha-date-input>
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
          <mwc-button class="button" @click=${this.delSchedule}>
            <ha-icon class="okTick" id="okTick" icon="mdi:check"></ha-icon>
            <div id="save_btn_text">Delete</div>
          </mwc-button>
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
      
      .button{
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
      .okTick{
        display: none;
        padding-right: 5px;
      }
    `
  ]

  static get styles() {
    return this.style;
  }
}
customElements.define("scheduler-card", SchedulerCard);