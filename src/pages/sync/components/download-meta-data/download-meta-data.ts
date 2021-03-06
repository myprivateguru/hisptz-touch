import { Component, OnInit } from '@angular/core';
import { AppProvider } from '../../../../providers/app/app';
import { UserProvider } from '../../../../providers/user/user';
import { DATABASE_STRUCTURE } from '../../../../models';
import * as _ from 'lodash';
import { EncryptionProvider } from '../../../../providers/encryption/encryption';
/**
 * Generated class for the DownloadMetaDataComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'download-meta-data',
  templateUrl: 'download-meta-data.html'
})
export class DownloadMetaDataComponent implements OnInit {
  resources: any;
  dataBaseStructure: any;
  currentUser: any;
  hasAllSelected: boolean;
  isLoading: boolean = true;
  isUpdateProcessOnProgress: boolean;
  isOnLogin: boolean = false;
  processes: string[];
  icons: any;

  constructor(
    private appProvider: AppProvider,
    private user: UserProvider,
    private encryptionProvider: EncryptionProvider
  ) {
    this.icons = {
      all: 'assets/icon/check-all.png',
      none: 'assets/icon/uncheck-all.png',
      reset: 'assets/icon/not-allowed.png',
      done: 'assets/icon/circle-tick.png'
    };
  }

  ngOnInit() {
    this.hasAllSelected = false;
    this.user.getCurrentUser().subscribe((user: any) => {
      const { password } = user;
      const { isPasswordEncode } = user;
      const newPassord = isPasswordEncode
        ? this.encryptionProvider.decode(password)
        : password;
      this.currentUser = { ...user, password: newPassord };
      this.resources = this.getListOfResources();
      this.autoSelect('');
      this.isLoading = false;
    });
  }

  getListOfResources() {
    const resources = [];
    const dataBaseStructure = DATABASE_STRUCTURE;
    Object.keys(dataBaseStructure).forEach((resource: any) => {
      if (dataBaseStructure[resource].isMetadata) {
        resources.push({
          name: resource,
          displayName: dataBaseStructure[resource].displayName
            ? dataBaseStructure[resource].displayName
            : resource,
          status: false,
          dependentTable: dataBaseStructure[resource].dependentTable
        });
      }
    });
    return resources;
  }

  autoSelect(selectType) {
    if (selectType == 'selectAll') {
      this.resources.map((resource: any) => {
        resource.status = true;
      });
      this.hasAllSelected = true;
    } else {
      this.resources.map((resource: any) => {
        resource.status = false;
      });
      this.hasAllSelected = false;
    }
  }

  checkingForResourceUpdate() {
    const resources = _.flattenDeep([...[], this.resources]);
    const resourceUpdated = resources
      .filter((resource: any) => resource.status)
      .map(resource => resource.name);
    if (resourceUpdated.length == 0) {
      this.appProvider.setNormalNotification('Please select at least one item');
    } else {
      this.updateResources(resourceUpdated);
    }
  }

  updateResources(resources) {
    this.processes = resources;
    this.isLoading = true;
    this.isUpdateProcessOnProgress = true;
  }

  onUpdateCurrentUser(currentUser) {
    this.currentUser = _.assign({}, this.currentUser, currentUser);
  }

  onCancelLoginProcess() {
    this.isLoading = false;
    this.isUpdateProcessOnProgress = false;
  }

  onFailLogin(errorReponse) {
    this.appProvider.setNormalNotification(errorReponse);
    this.onCancelLoginProcess();
  }

  onSuccessLogin(data) {
    const { currentUser } = data;
    this.isLoading = false;
    this.isUpdateProcessOnProgress = false;
    this.onUpdateCurrentUser(currentUser);
    const resources = _.flattenDeep([...[], this.resources]);
    const updatedResources = resources
      .filter((resource: any) => resource.status)
      .map(resource => resource.displayName)
      .join(', ');
    this.autoSelect('');
    const message =
      updatedResources.split(', ').length > 1
        ? `${updatedResources} have been updated successfully`
        : `${updatedResources} has been updated successfully`;
    this.appProvider.setNormalNotification(message);
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index;
  }
}
