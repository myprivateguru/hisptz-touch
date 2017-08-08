import { Component,OnInit } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import {SettingsProvider} from "../../providers/settings/settings";
import {UserProvider} from "../../providers/user/user";
import {AppProvider} from "../../providers/app/app";

/**
 * Generated class for the SettingsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage implements OnInit{

  isSettingContentOpen : any;
  settingContents : Array<any>;

  isSettingLoaded : boolean = false;
  settingObject : any;
  settingLoadingMessage : string;

  currentUser : any;


  constructor(private settingsProvider : SettingsProvider,
              private appProvider : AppProvider,
              private userProvider : UserProvider) {
  }

  ngOnInit(){
    this.settingObject  = {};
    this.settingLoadingMessage = 'Load current user information';
    this.isSettingLoaded = false;
    this.isSettingContentOpen = {};
    this.settingContents = this.settingsProvider.getSettingContentDetails();
    if(this.settingContents.length > 0){
      this.toggleSettingContents(this.settingContents[0]);
    }
    let defaultSettings = this.settingsProvider.getDefaultSettings();
    this.userProvider.getCurrentUser().then(currentUser=>{
      this.currentUser = currentUser;
      this.settingLoadingMessage = 'Loading settings';
      this.settingsProvider.getSettingsForTheApp(this.currentUser).then((appSettings : any)=>{
        this.initiateSettings(defaultSettings,appSettings);
      }).catch(error=>{
        console.log(error);
        this.isSettingLoaded = true;
        this.initiateSettings(defaultSettings,null);
        this.appProvider.setNormalNotification('Fail to load settings');
      });
    }).catch(error=>{
      console.log(error);
      this.isSettingLoaded = true;
      this.initiateSettings(defaultSettings,null);
      this.appProvider.setNormalNotification('Fail to load current user information');
    });
  }

  initiateSettings(defaultSettings,appSettings){
    if(appSettings){
      if(appSettings.synchronization){
        this.settingObject['synchronization'] = appSettings.synchronization;
      }else{
        this.settingObject['synchronization'] = defaultSettings.synchronization;
      }
      if(appSettings.entryForm){
        this.settingObject['entryForm'] = appSettings.dataEntry;
      }else{
        this.settingObject['entryForm'] = defaultSettings.dataEntry;
      }
    }else{
      this.settingObject = defaultSettings;
    }
    let timeValue = this.settingObject.synchronization.time;
    let timeType = this.settingObject.synchronization.timeType;
    this.settingObject.synchronization.time = this.settingsProvider.getDisplaySynchronizationTime(timeValue,timeType);
    this.isSettingLoaded = true;
  }

  //@todo process during saving
  applySettings(settingContent){
    settingContent = this.settingsProvider.getSanitizedSettings(settingContent);
    this.settingsProvider.setSettingsForTheApp(this.currentUser,settingContent).then(()=>{

    }).catch(error=>{

    });
    console.log('About to save ' + settingContent.name);
  }

  toggleSettingContents(content){
    if(content && content.id){
      if(this.isSettingContentOpen[content.id]){
        this.isSettingContentOpen[content.id] = false;
      }else{
        Object.keys(this.isSettingContentOpen).forEach(id=>{
          this.isSettingContentOpen[id] = false;
        });
        this.isSettingContentOpen[content.id] = true;
      }
    }
  }

}
