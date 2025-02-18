# Testing Cheat Sheet for Salesforce Package Development

## Testing Libraries and Frameworks

- Jest: Primary testing framework
- Sinon: Used for creating stubs, mocks, and spies
- Chai: Assertion library
- @salesforce/core/testSetup: Provides TestContext and MockTestOrgData

## Mocking and Stubbing

- Use `$$.SANDBOX.stub()` to create stubs
- Common stubs:
  - `SfCommand.prototype.log`
  - `SfCommand.prototype.warn`
  - `SfCommand.prototype.table`
  - `SfCommand.prototype.styledHeader`
  - `PackageVersion.prototype.report`
  - `SubscriberPackageVersion.prototype.getInstallRequest`

Example:

```typescript
const logStub = $$.SANDBOX.stub(SfCommand.prototype, 'log');
```

## Test Setup and Teardown

- Use `before()` for test suite setup
- Use `beforeEach()` for individual test setup
- Use `after()` for test suite cleanup
- Use `afterEach()` for individual test cleanup

Example:

```typescript
before(async () => {
  await $$.stubAuths(testOrg);
  await config.load();
});

afterEach(() => {
  $$.restore();
  $$.SANDBOX.restore();
});
```

## Fake Implementations

- Create fake objects that mimic real data structures
- Use these for consistent test data across multiple tests

Example:

```typescript
const pkgVersionCreateSuccessResult: PackageVersionCreateRequestResult = {
  Id: '08c3i000000fylgAAA',
  Status: Package2VersionStatus.success,
  // ... other properties
};
```

## Command Testing

- Use `execCmd()` to run CLI commands in tests
- Check both human-readable and JSON outputs
- Verify exit codes for success and failure scenarios

Example:

```typescript
const result = execCmd(`package:version:create --package ${packageId} --json`, { ensureExitCode: 0 });
expect(result.jsonOutput?.result).to.have.property('Id');
```

## Assertion Patterns

- Use Chai's `expect()` for assertions
- Common assertions:
  - `.to.equal()`
  - `.to.deep.equal()`
  - `.to.match()`
  - `.to.have.property()`
  - `.to.be.true`
  - `.to.contain()`

Example:

```typescript
expect(result.Status).to.equal('Success');
expect(logStub.callCount).to.equal(1);
expect(logStub.args[0][0]).to.match(/Successfully created the package version/);
```

## Error Testing

- Use try-catch blocks to test for expected errors
- Assert on error messages and types

Example:

```typescript
try {
  await command.run();
  assert.fail('Expected an error to be thrown');
} catch (e) {
  expect((e as Error).message).to.include('Invalid package ID');
}
```

## Spinner and UX Testing

- Stub spinner methods to prevent actual spinning in tests
- Check if spinner methods were called as expected

Example:

```typescript
const stubSpinner = (cmd: PackageVersionCreateCommand) => {
  $$.SANDBOX.stub(cmd.spinner, 'start');
  $$.SANDBOX.stub(cmd.spinner, 'stop');
};
```

## TestSession Usage

- Use TestSession for integration-like tests
- Set up project configurations and org authentications

Example:

```typescript
const session = await TestSession.create({
  devhubAuthStrategy: 'AUTO',
  project: { name: 'packageCreateDelete' },
});
```

## Environment Variables

- Use environment variables for sensitive data or test-specific configurations
- Example: `process.env.ONEGP_TESTKIT_AUTH_URL`

## JSON Output Testing

- Parse JSON output and verify specific properties
- Use type assertions for better type checking

Example:

```typescript
const output = execCmd<PackageVersionCreateRequestResult>(command, { ensureExitCode: 0 }).jsonOutput?.result;
expect(output).to.have.all.keys(['Id', 'Status', 'Package2Id' /* ... */]);
```

## Handling Asynchronous Operations

- Use async/await for handling asynchronous code
- Implement polling mechanisms for long-running operations

Example:

```typescript
const pollUntilComplete = async (id: string): Promise<PackageUploadRequest> => {
  const result = execCmd<PackageUploadRequest>(`package1:version:create:get -i ${id} -o 1gp --json`, {
    ensureExitCode: 0,
  }).jsonOutput?.result;
  if (result?.Status === 'SUCCESS') {
    return result;
  } else {
    await sleep(5000);
    return pollUntilComplete(id);
  }
};
```
