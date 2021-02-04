# Installation and Operations Guides

This page summarizes the options for getting OpenProject, some hosted and some on-premise. With this information you should be able to decide what option is best for you.

### On-premises

* **Community edition** - The free, no license, edition of OpenProject that you install on-premise. The additional features of the Enterprise edition are not included. See the "Installation" row of the table below.
* **Enterprise on-premise edition** - Builds on top of the Community edition: additional features, professional support, hosted on-premise with optional installation support. See more [on the website](https://www.openproject.org/enterprise-edition/), where you can apply for a free trial, or [in the Documentation](../enterprise-edition-guide/).

### Hosted

* **Enterprise cloud edition** - Hosted by OpenProject in an EU Data Center, with additional features and professional support . See more [on the website](https://www.openproject.org/hosting/), where you can apply for a free trial, or [in the Documentation](../cloud-edition-guide/).

* **Univention App Center** - Download the free Community edition as a pre-installed virtual environment and upgrade to the Enterprise edition with premium features and support. See the [Documention for details.](installation/univention/)



All editions can be enhanced by adding **[the BIM module](https://www.openproject.org/bim-project-management/)**, including features for construction project management, i.e. 3D model viewer, BCF management. See how to [switch to that edition](changing-to-bim-edition) in the Documentation or how to start a [BIM cloud edition](https://start.openproject-edge.com/go/bim).

Compare the features of these versions [on the website](https://www.openproject.org/pricing/#compare). The Community edition can easily be upgraded to the Enterprise edition.

* **Development** - OpenProject is open source; if you want to help with the code, check the [development instructions](../development/) and install a [development environment.](../development/#additional-resources)

<div class="alert alert-info" role="alert">
**Note**: there are some minor options given in the "Other" row of the table below. These are not recommended but you may wish to try them.
</div>

## On-premises installation overview

| Main Topics | Description |
| ----------- | :---------- |
| [System requirements](system-requirements) | Learn the minimum configuration required to run OpenProject |
| [Installation](installation/) | How to install OpenProject and the methods available |
| [Operations & Maintenance](operation/) | Guides on how to configure, backup, upgrade, and monitor your OpenProject installation |
| [Advanced configuration](configuration/) | Guides on how to perform advanced configuration of your OpenProject installation |
| [Other](misc/) | Guides on infrequent operations such as MySQL to PostgreSQL migration |

For production environments and when using a [supported distribution](system-requirements), we recommend using the [packaged installation](installation/packaged/). This will install OpenProject as a system dependency using your distribution's package manager, and provide updates in the same fashion that all other system packages do.

A [manual installation](installation/manual) option is also documented, but due to the large number of components involved and the rapid evolution of OpenProject, we cannot ensure that the procedure is either up-to-date or that it will correctly work on your machine. This means that manual installation is NOT recommended.

## Frequently asked questions (FAQ)

### Are there extra fees to pay, in terms of installing the OpenProject software?

The Community and [Enterprise on-premises edition](https://www.openproject.org/enterprise-edition/) are on-premises solutions and thus need installation from your side while the [Enterprise cloud edition](https://www.openproject.org/hosting/) is hosted by us. The Community edition is for free and we ask you to do the installation yourself. Of course we support you with a clear and easy [installation guide](https://www.openproject.org/download-and-installation/). If you would like us to install the Enterprise on-premises edition for you, we are charging a fee for this once-off service. You can add the installation support during your Enterprise on-premises edition booking process.
