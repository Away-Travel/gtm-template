# Google Tag Manager Consent Mode Template

This repo contains the source code for the Google Tag Manager (GTM) template that integrates Fides with GTM Consent Mode. For the people setting up the integration, you'll mostly be interested in the `template.tpl` file. See [Consent Mode documentation](https://ethyca.com/docs/tutorials/consent-management/consent-management-configuration/google-tag-manager-consent-mode) for more details. The rest of the README is aimed at developers.

## Building

There currently are no dependencies besides a recent Node version, so after cloning this repo, simply run the following to build the template:

```shell
npm run build
```

This will update the `template.tpl` file at the root of the repo. It's meant to be checked in so make sure you run the build command and commit the changes before merging to `main`.