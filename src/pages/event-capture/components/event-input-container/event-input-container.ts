import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { SettingsProvider } from '../../../../providers/settings/settings';
import { ActionSheetController } from 'ionic-angular';

/**
 * Generated class for the EventInputContainerComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'event-input-container',
  templateUrl: 'event-input-container.html'
})
export class EventInputContainerComponent implements OnInit, OnDestroy {
  @Input() dataElement;
  @Input() currentUser;
  @Input() mandatory;
  @Input() data;
  @Input() dataValuesSavingStatusClass;
  @Output() onChange = new EventEmitter();

  fieldLabelKey: any;
  textInputField: Array<string>;
  numericalInputField: Array<string>;
  supportValueTypes: Array<string>;
  dataEntrySettings: any;
  barcodeSettings: any;
  isLoading: boolean;

  constructor(
    private settingsProvider: SettingsProvider,
    private actionSheetCtrl: ActionSheetController
  ) {
    this.isLoading = true;
  }

  ngOnInit() {
    this.numericalInputField = [
      'INTEGER_NEGATIVE',
      'INTEGER_POSITIVE',
      'INTEGER',
      'NUMBER',
      'INTEGER_ZERO_OR_POSITIVE'
    ];
    this.textInputField = ['TEXT', 'LONG_TEXT'];
    this.supportValueTypes = [
      'BOOLEAN',
      'TRUE_ONLY',
      'DATE',
      'DATETIME',
      'TIME',
      'TEXT',
      'LONG_TEXT',
      'INTEGER_NEGATIVE',
      'INTEGER_POSITIVE',
      'INTEGER',
      'NUMBER',
      'INTEGER_ZERO_OR_POSITIVE',
      'COORDINATE',
      'ORGANISATION_UNIT',
      'UNIT_INTERVAL',
      'PERCENTAGE',
      'EMAIL',
      'PHONE_NUMBER',
      'AGE'
    ];
    this.fieldLabelKey = this.dataElement.name;
    this.settingsProvider
      .getSettingsForTheApp(this.currentUser)
      .subscribe((appSettings: any) => {
        const dataEntrySettings = appSettings.entryForm;
        this.dataEntrySettings = dataEntrySettings;
        this.barcodeSettings = appSettings.barcode;
        if (dataEntrySettings.label) {
          if (
            this.dataElement[dataEntrySettings.label] &&
            isNaN(this.dataElement[dataEntrySettings.label])
          ) {
            this.fieldLabelKey = this.dataElement[dataEntrySettings.label];
          }
        }
        this.isLoading = false;
      });
  }

  showTooltips() {
    let title = this.fieldLabelKey;
    let subTitle = '';
    if (this.dataElement.description) {
      title += '. Description : ' + this.dataElement.description;
    }
    subTitle +=
      'Value Type : ' +
      this.dataElement.valueType.toLocaleLowerCase().replace(/_/g, ' ');
    if (this.dataElement.optionSet) {
      title +=
        '. It has ' +
        this.dataElement.optionSet.options.length +
        ' options to select.';
    }
    let actionSheet = this.actionSheetCtrl.create({
      title: title,
      subTitle: subTitle
    });
    actionSheet.present();
  }

  updateValue(updatedValue) {
    this.dataValuesSavingStatusClass[updatedValue.id] =
      'input-field-container-saving';
    this.onChange.emit(updatedValue);
  }

  ngOnDestroy() {
    this.currentUser = null;
    this.dataElement = null;
    this.mandatory = null;
    this.data = null;
  }
}
