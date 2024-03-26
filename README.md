<!-- markdownlint-disable-next-line first-line-heading -->
<div align="center" width="100%">
<!-- start branding -->

<img src=".github/ghadocs/branding.svg" width="15%" align="center" alt="branding<icon:anchor color:gray-dark>" />

<!-- end branding -->
<!-- start title -->

# <img src=".github/ghadocs/branding.svg" width="60px" align="center" alt="branding<icon:anchor color:gray-dark>" /> GitHub Action: Docker Compose Action

<!-- end title -->
<!-- start badges -->

<a href="https%3A%2F%2Fgithub.com%2F%2F%2Freleases%2Flatest"><img src="https://img.shields.io/github/v/release//?display_name=tag&sort=semver&logo=github&style=flat-square" alt="Release%20by%20tag" /></a><a href="https%3A%2F%2Fgithub.com%2F%2F%2Freleases%2Flatest"><img src="https://img.shields.io/github/release-date//?display_name=tag&sort=semver&logo=github&style=flat-square" alt="Release%20by%20date" /></a><img src="https://img.shields.io/github/last-commit//?logo=github&style=flat-square" alt="Commit" /><a href="https%3A%2F%2Fgithub.com%2F%2F%2Fissues"><img src="https://img.shields.io/github/issues//?logo=github&style=flat-square" alt="Open%20Issues" /></a><img src="https://img.shields.io/github/downloads///total?logo=github&style=flat-square" alt="Downloads" />

 <!-- end badges -->

</div>
<!-- start description -->

Run your docker-compose file

<!-- end description -->
<!-- start contents -->
<!-- end contents -->
<!-- start usage -->

```yaml
- uses: /@v1.0.0
  with:
    # Description: Relative path to compose file(s). It can be a list of files.
    #
    # Default: ./docker-compose.yml
    compose-file: ""

    # Description: Services to perform docker-compose up.
    #
    services: ""

    # Description: Additional options to pass to `docker-compose up` command.
    #
    # Default:
    up-flags: ""

    # Description: Additional options to pass to `docker-compose down` command.
    #
    # Default:
    down-flags: ""

    # Description: Additional options to pass to `docker-compose` command.
    #
    # Default:
    compose-flags: ""
```

<!-- end usage -->
<!-- start inputs -->

| **Input**                  | **Description**                                                         | **Default**                       | **Required** |
| -------------------------- | ----------------------------------------------------------------------- | --------------------------------- | ------------ |
| <code>compose-file</code>  | Relative path to compose file(s). It can be a list of files.            | <code>./docker-compose.yml</code> | **false**    |
| <code>services</code>      | Services to perform docker-compose up.                                  |                                   | **false**    |
| <code>up-flags</code>      | Additional options to pass to <code>docker-compose up</code> command.   |                                   | **false**    |
| <code>down-flags</code>    | Additional options to pass to <code>docker-compose down</code> command. |                                   | **false**    |
| <code>compose-flags</code> | Additional options to pass to <code>docker-compose</code> command.      |                                   | **false**    |

<!-- end inputs -->
<!-- start outputs -->
<!-- end outputs -->
<!-- start [.github/ghadocs/examples/] -->
<!-- end [.github/ghadocs/examples/] -->
