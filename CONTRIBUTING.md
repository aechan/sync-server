# Contribution Guidelines
This project uses a git rebase workflow. If you do not know what this is, read [this article](https://randyfay.com/content/rebase-workflow-git). 

Any feature you work on should have its own *feature branch* based off of the `development` branch and while you are working on your feature, periodically rebase your feature branch on `development` to integrate the newest changes and stay up to date. 

When finished with your feature, rebase your work on top of `development` again and then submit a pull request from your branch into `development` and assign any reviewers as well as the code owners. 

In your pull request summarize the changes/additions you made and their impact.

# About CODEOWNERS
The `CODEOWNERS` file outlines who owns what code and when a pull request is opened that changes any of that code, the relevant code owners will be automatically assigned to review.

If you create any files or directories, you should add yourself as a code owner to those in the `.github/CODEOWNERS` file. See [here](https://help.github.com/articles/about-codeowners/) for syntax. Then open a pull request with just your changes to `CODEOWNERS` to update the file on GitHub.