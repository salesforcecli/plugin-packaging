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
import { Connection } from '@salesforce/core';
import { expect } from 'chai';
import sinon from 'sinon';
import { PackageLinkService } from '../../src/utils/packageLink.js';

const verifiedOrg15 = '00D000000000001';
const verifiedOrg18 = '00D000000000001EAA';

const createConnection = ({
  autoFetchQuery = sinon.stub().resolves({ records: [] }),
  apiVersion = '68.0',
  orgId = verifiedOrg18,
}: {
  autoFetchQuery?: sinon.SinonStub;
  apiVersion?: string;
  orgId?: string;
} = {}) =>
  ({
    autoFetchQuery,
    getApiVersion: sinon.stub().returns(apiVersion),
    getAuthInfoFields: sinon.stub().returns({ orgId }),
  } as unknown as Connection);

describe('PackageLinkService', () => {
  it('queries inbound VerifiedDev requests and excludes self-trust', async () => {
    const autoFetchQuery = sinon.stub().resolves({
      records: [
        {
          Id: '2vt000000000001AAA',
          AuthoringOrg: '00D000000000002',
          VerifiedOrg: verifiedOrg15,
          Status: 'Pending',
          RequestedBy: 'Ada Lovelace',
          CreatedDate: '2026-08-24T00:00:00.000Z',
          EstablishedDate: null,
          RevokedDate: null,
          attributes: { type: 'PkgVrfyAuthOrgTrustRela' },
        },
      ],
    });

    const result = await new PackageLinkService(createConnection({ autoFetchQuery })).list();

    expect(result).to.deep.equal([
      {
        Id: '2vt000000000001AAA',
        AuthoringOrg: '00D000000000002',
        VerifiedOrg: verifiedOrg15,
        Status: 'Pending',
        RequestedBy: 'Ada Lovelace',
        CreatedDate: '2026-08-24T00:00:00.000Z',
        EstablishedDate: null,
        RevokedDate: null,
      },
    ]);
    expect(autoFetchQuery.calledOnce).to.equal(true);
    expect(autoFetchQuery.firstCall.args[0]).to.equal(
      "SELECT Id, AuthoringOrg, VerifiedOrg, Status, RequestedBy, CreatedDate, EstablishedDate, RevokedDate FROM PkgVrfyAuthOrgTrustRela WHERE VerifiedOrg = '00D000000000001' AND OrganizationType = 'Verified' AND AuthoringOrg != '00D000000000001' ORDER BY CreatedDate DESC"
    );
    expect(autoFetchQuery.firstCall.args[1]).to.deep.equal({ tooling: true });
  });

  it('maps approved to the Accepted API status', async () => {
    const autoFetchQuery = sinon.stub().resolves({ records: [] });
    await new PackageLinkService(createConnection({ autoFetchQuery })).list('approved');
    expect(autoFetchQuery.firstCall.args[0]).to.contain("AND Status = 'Accepted'");
  });

  it('compares API versions numerically', () => {
    expect(() => new PackageLinkService(createConnection({ apiVersion: '100.0' }))).not.to.throw();
    expect(() => new PackageLinkService(createConnection({ apiVersion: '67.0' }))).to.throw(
      'Package link requires API version 68.0 or later.'
    );
    expect(() => new PackageLinkService(createConnection({ apiVersion: 'invalid' }))).to.throw(
      'Package link requires API version 68.0 or later.'
    );
  });

  it('requires an org ID', () => {
    expect(() => new PackageLinkService(createConnection({ orgId: '' }))).to.throw(
      'Unable to determine the target org ID'
    );
  });
});
