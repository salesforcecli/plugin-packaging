/*
 * Copyright 2026, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { MockTestOrgData, TestContext } from '@salesforce/core/testSetup';
import { Config } from '@oclif/core';
import { expect } from 'chai';
import { Package } from '@salesforce/packaging';
import sinon from 'sinon';
import { SfCommand } from '@salesforce/sf-plugins-core';
import { SfProject } from '@salesforce/core';
import { PackageVersionDisplayDependenciesCommand } from '../../../src/commands/package/version/displaydependencies.js';

const DOT_OUTPUT = `strict digraph G {
  node_04tXXX [label="Pkg@1.0.0.0" color="green"]
  node_04tYYY [label="Dep@2.0.0.1" color="green"]
  node_04tXXX -> node_04tYYY
}`;

describe('package:version:displaydependencies', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  const config = new Config({ root: import.meta.url });

  let logStub: sinon.SinonStub;
  let getDependencyGraphStub: sinon.SinonStub;

  before(async () => {
    await $$.stubAuths(testOrg);
    await config.load();
  });

  beforeEach(async () => {
    logStub = $$.SANDBOX.stub(SfCommand.prototype, 'log');
    getDependencyGraphStub = $$.SANDBOX.stub(Package, 'getDependencyGraph').resolves({
      getDependencyDotProducer: sinon.stub().resolves({
        produce: sinon.stub().returns(DOT_OUTPUT),
      }),
    } as never);
  });

  afterEach(() => {
    $$.restore();
    $$.SANDBOX.restore();
  });

  it('should call getDependencyGraph with installation key when provided', async () => {
    const command = new PackageVersionDisplayDependenciesCommand(
      ['-p', '04tXXXXXXXXXXXXXX0', '-v', testOrg.username, '-k', 'myKey123'],
      config
    );
    command.project = SfProject.getInstance();

    await command.run();

    expect(getDependencyGraphStub.calledOnce).to.be.true;
    const callArgs = getDependencyGraphStub.firstCall.args;
    expect(callArgs[0]).to.equal('04tXXXXXXXXXXXXXX0');
    expect(callArgs[3]).to.deep.include({ installationKey: 'myKey123' });
  });

  it('should call getDependencyGraph without installation key when not provided', async () => {
    const command = new PackageVersionDisplayDependenciesCommand(
      ['-p', '04tXXXXXXXXXXXXXX0', '-v', testOrg.username],
      config
    );
    command.project = SfProject.getInstance();

    await command.run();

    expect(getDependencyGraphStub.calledOnce).to.be.true;
    const callArgs = getDependencyGraphStub.firstCall.args;
    expect(callArgs[0]).to.equal('04tXXXXXXXXXXXXXX0');
    expect(callArgs[3]).to.deep.include({ installationKey: undefined });
  });

  it('should output DOT code to stdout when not --json', async () => {
    const command = new PackageVersionDisplayDependenciesCommand(
      ['-p', '04tXXXXXXXXXXXXXX0', '-v', testOrg.username],
      config
    );
    command.project = SfProject.getInstance();

    await command.run();

    expect(logStub.calledOnce).to.be.true;
    expect(logStub.firstCall.args[0]).to.equal(DOT_OUTPUT);
  });

  it('should return DOT code as result when --json', async () => {
    const command = new PackageVersionDisplayDependenciesCommand(
      ['-p', '04tXXXXXXXXXXXXXX0', '-v', testOrg.username, '--json'],
      config
    );
    command.project = SfProject.getInstance();

    const result = await command.run();

    expect(result).to.equal(DOT_OUTPUT);
    expect(logStub.called).to.be.false;
  });

  it('should pass edge-direction option to getDependencyGraph', async () => {
    const command = new PackageVersionDisplayDependenciesCommand(
      ['-p', '04tXXXXXXXXXXXXXX0', '-v', testOrg.username, '--edge-direction', 'root-last'],
      config
    );
    command.project = SfProject.getInstance();

    await command.run();

    const callArgs = getDependencyGraphStub.firstCall.args;
    expect(callArgs[3]).to.deep.include({ edgeDirection: 'root-last' });
  });
});
