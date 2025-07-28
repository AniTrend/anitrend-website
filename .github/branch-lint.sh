#!/bin/sh

BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)
VALID_PREFIXES="feat, fix, chore, docs, refactor, test, build, ci, revert"
EXPRESSION="^(feat|fix|chore|docs|refactor|test|build|ci|revert)\/[a-z0-9\-]+$"

# Check if the branch name matches the required format
if [[ ! "$BRANCH_NAME" =~ $EXPRESSION ]]; then
  echo "Error: Invalid branch name: $BRANCH_NAME"
  echo ""
  echo "Branch names must follow the format: <type>/<description>"
  echo "For example: feat/add-login-feature or fix/bug-in-login"
  echo ""
  echo "Allowed branch types are:"
  echo "  - feat:      A new feature"
  echo "  - fix:       A bug fix"
  echo "  - chore:     Routine tasks (build processes, dependencies)"
  echo "  - docs:      Documentation only changes"
  echo "  - refactor:  Code change that neither fixes a bug nor adds a feature"
  echo "  - test:      Adding missing tests or correcting existing tests"
  echo "  - build:     Changes that affect the build system or dependencies"
  echo "  - ci:        Changes to CI configuration files"
  echo "  - revert:    Reverting a previous commit"
  exit 1
fi
