/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from 'fs';
import * as path from 'path';
import { testSetup } from '@salesforce/core/lib/testSetup';
import { Result } from '@salesforce/command';
import { fromStub, stubInterface, stubMethod } from '@salesforce/ts-sinon';
import { Org, SfProject } from '@salesforce/core';
import { Config } from '@oclif/core';
import { afterEach } from 'mocha';
import { expect } from 'chai';
import { PackageVersion, PackageVersionCreateRequestResult } from '@salesforce/packaging';
import { PackageVersionCreateCommand } from '../../../../src/commands/force/package/beta/version/create';

const $$ = testSetup();
const oclifConfigStub = fromStub(stubInterface<Config>($$.SANDBOX));

async function setupProject(setup: (project: SfProject) => void = () => {}) {
  const project = await SfProject.resolve();
  const packageDirectories = [
    {
      package: 'my_package_alias',
      path: 'force-app',
      default: true,
    },
    {
      package: 'my_other_package_alias',
      path: 'force-app/other',
      default: false,
    },
  ];
  const packageAliases = { ['my_package_alias']: '0Ho6A000002zgKSQAY' };

  project.getSfProjectJson().set('packageDirectories', packageDirectories);
  project.getSfProjectJson().set('packageAliases', packageAliases);
  setup(project);
  const projectDir = project.getPath();
  project
    .getSfProjectJson()
    .getContents()
    .packageDirectories?.forEach((dir) => {
      if (dir.path) {
        const packagePath = path.join(projectDir, dir.path);
        fs.mkdirSync(packagePath, { recursive: true });
      }
    });

  return project;
}

class TestCommand extends PackageVersionCreateCommand {
  public async runIt() {
    this.result = new Result(this.statics.result);
    await this.init();
    stubMethod($$.SANDBOX, this.ux, 'log');
    this.result.data = await this.run();
    await this.finally(undefined);
    return this.result.data;
  }
  public setOrg(org: Org) {
    this.org = org;
  }
  public setHub(org: Org) {
    this.hubOrg = org;
  }

  public async setProject(project: SfProject): Promise<void> {
    this.project = project || (await setupProject());
  }
}

const prepCmd = async (params: string[], project?: SfProject): Promise<TestCommand> => {
  const cmd = new TestCommand(params, oclifConfigStub);
  stubMethod($$.SANDBOX, cmd, 'assignOrg').callsFake(() => {
    const orgStub = fromStub(
      stubInterface<Org>($$.SANDBOX, {
        getUsername: () => 'test@user.com',
        getConnection: () => ({}),
      })
    );
    cmd.setOrg(orgStub);
  });
  stubMethod($$.SANDBOX, cmd, 'assignHubOrg').callsFake(() => {
    const orgStub = fromStub(
      stubInterface<Org>($$.SANDBOX, {
        getUsername: () => 'test@user.com',
        getConnection: () => ({}),
      })
    );
    cmd.setHub(orgStub);
  });
  fs.mkdirSync(path.join(project.getPath(), 'force-app/other'), { recursive: true });
  await cmd.setProject(project);
  return cmd;
};

describe('resolvePackageIdFromFlags', () => {
  let idResolutionSpy: sinon.SinonSpy;
  beforeEach(() => {
    $$.inProject(true);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    idResolutionSpy = $$.SANDBOX.spy(PackageVersionCreateCommand.prototype, 'resolvePackageIdFromFlags');
  });
  afterEach(() => {
    $$.SANDBOX.restore();
  });
  it('should return the package id from using package flag = alias', async () => {
    const project = await setupProject();
    const cmd = await prepCmd(
      ['--package', 'my_package_alias', '--installationkeybypass', '-v', 'test@user.com'],
      project
    );
    $$.SANDBOX.stub(PackageVersion, 'create').resolves({
      Status: 'Success',
    } as Partial<PackageVersionCreateRequestResult>);
    await cmd.runIt();
    expect(idResolutionSpy.calledOnce).to.be.true;
    expect(idResolutionSpy.firstCall.returnValue).to.equal('0Ho6A000002zgKSQAY');
  });
  it('should return the package id from using package flag = Id (oH0)', async () => {
    const project = await setupProject();
    const cmd = await prepCmd(
      ['--package', '0Ho6A000002zgKSQAY', '--installationkeybypass', '-v', 'test@user.com'],
      project
    );
    $$.SANDBOX.stub(PackageVersion, 'create').resolves({
      Status: 'Success',
    } as Partial<PackageVersionCreateRequestResult>);
    await cmd.runIt();
    expect(idResolutionSpy.calledOnce).to.be.true;
    expect(idResolutionSpy.firstCall.returnValue).to.equal('0Ho6A000002zgKSQAY');
  });
  it('should return the package id from using path flag = force-app', async () => {
    const project = await setupProject();
    const cmd = await prepCmd(['--path', './force-app', '--installationkeybypass', '-v', 'test@user.com'], project);
    $$.SANDBOX.stub(PackageVersion, 'create').resolves({
      Status: 'Success',
    } as Partial<PackageVersionCreateRequestResult>);
    $$.SANDBOX.stub(process, 'cwd').returns(project.getPath());
    await cmd.runIt();
    expect(idResolutionSpy.calledOnce).to.be.true;
    expect(idResolutionSpy.firstCall.returnValue).to.equal('0Ho6A000002zgKSQAY');
  });
  it('should return the package id from using path flag = force-app/other', async () => {
    const project = await setupProject();
    const cmd = await prepCmd(
      ['--path', './force-app/other', '--installationkeybypass', '-v', 'test@user.com'],
      project
    );
    $$.SANDBOX.stub(PackageVersion, 'create').resolves({
      Status: 'Success',
    } as Partial<PackageVersionCreateRequestResult>);
    $$.SANDBOX.stub(process, 'cwd').returns(project.getPath());
    await cmd.runIt();
    expect(idResolutionSpy.calledOnce).to.be.true;
    expect(idResolutionSpy.firstCall.returnValue).to.equal('0Ho6A000002zgKSQAY');
  });
  it('should throw when using package flag = not-an-alias', async () => {
    const project = await setupProject();
    const cmd = await prepCmd(['--package', 'not-an-alias', '--installationkeybypass', '-v', 'test@user.com'], project);
    try {
      await cmd.runIt();
      expect.fail('should have thrown');
    } catch (e) {
      expect((e as Error).message).to.equal(
        'The package "not-an-alias" isn’t defined in the sfdx-project.json file. Add it to the packageDirectories section and add the alias to packageAliases with its 0Ho ID.'
      );
    }
    expect(idResolutionSpy.calledOnce).to.be.true;
    expect(idResolutionSpy.firstCall.exception).to.have.property('name', 'ErrorMissingPackageError');
  });
  it('should throw when using package flag = 0Honot-an-valid-id', async () => {
    const project = await setupProject();
    const cmd = await prepCmd(
      ['--package', '0Honot-an-valid-id', '--installationkeybypass', '-v', 'test@user.com'],
      project
    );
    try {
      await cmd.runIt();
      expect.fail('should have thrown');
    } catch (e) {
      expect((e as Error).message).to.equal(
        'The package "0Honot-an-valid-id" isn’t defined in the sfdx-project.json file. Add it to the packageDirectories section and add the alias to packageAliases with its 0Ho ID.'
      );
    }
    expect(idResolutionSpy.calledOnce).to.be.true;
    expect(idResolutionSpy.firstCall.exception).to.have.property('name', 'ErrorMissingPackageError');
  });
  it('should throw when using path flag = path-not-hear', async () => {
    const project = await setupProject();
    $$.SANDBOX.stub(process, 'cwd').returns(project.getPath());
    fs.mkdirSync(path.join(project.getPath(), 'path-not-hear'), { recursive: true });
    const cmd = await prepCmd(['--path', 'path-not-hear', '--installationkeybypass', '-v', 'test@user.com'], project);
    try {
      await cmd.runIt();
      expect.fail('should have thrown');
    } catch (e) {
      expect((e as Error).message).to.equal(
        'Could not find a package in sfdx-project.json file using "path" path-not-hear. Add it to the packageDirectories section and add the alias to packageAliases with its 0Ho ID.'
      );
    }
    expect(idResolutionSpy.calledOnce).to.be.true;
    expect(idResolutionSpy.firstCall.exception).to.have.property('name', 'ErrorCouldNotFindPackageUsingPathError');
  });
});
