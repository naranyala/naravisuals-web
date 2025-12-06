<template>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1 class="title">Git Cheat Sheet</h1>
      <p class="subtitle">Quick reference for Git commands</p>
    </div>

    <!-- Search -->
    <input
      v-model="search"
      placeholder="Search commands..."
      class="search"
    />

    <!-- Grid -->
    <div class="grid">
      <div v-for="cat in filtered" :key="cat.title" class="card">
        <div class="card-header" :style="{ backgroundColor: cat.color }">
          {{ cat.title }}
        </div>
        <ul class="command-list">
          <li v-for="c in cat.commands" :key="c.cmd" class="command-item">
            <div>
              <code class="cmd">{{ c.cmd }}</code>
              <div class="desc">{{ c.desc }}</div>
            </div>
            <button @click="copy(c.cmd)" class="copy-btn">Copy</button>
          </li>
        </ul>
      </div>
    </div>

    <p v-if="filtered.length === 0" class="no-results">No commands found</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const search = ref('')

const categories = [
  {
    title: 'Setup & Configuration',
    color: '#f97316',
    commands: [
      { cmd: 'git init', desc: 'Initialize a new repository' },
      { cmd: 'git clone <url>', desc: 'Clone a repository' },
      { cmd: 'git config --global user.name "name"', desc: 'Set global username' },
      { cmd: 'git config --global user.email "email"', desc: 'Set global email' },
      { cmd: 'git config --list', desc: 'List all configuration settings' },
      { cmd: 'git config --global alias.<alias> <command>', desc: 'Create command alias' },
      { cmd: 'git remote add origin <url>', desc: 'Add remote repository' },
      { cmd: 'git remote -v', desc: 'View remote repositories' },
    ]
  },
  {
    title: 'Basic Workflow',
    color: '#3b82f6',
    commands: [
      { cmd: 'git status', desc: 'Check status of files' },
      { cmd: 'git status -s', desc: 'Short status format' },
      { cmd: 'git add .', desc: 'Stage all changes' },
      { cmd: 'git add <file>', desc: 'Stage specific file' },
      { cmd: 'git add -p', desc: 'Stage changes interactively' },
      { cmd: 'git commit -m "message"', desc: 'Commit with message' },
      { cmd: 'git commit -am "message"', desc: 'Add and commit tracked files' },
      { cmd: 'git commit --amend', desc: 'Modify last commit' },
      { cmd: 'git push', desc: 'Push to remote' },
      { cmd: 'git push -u origin <branch>', desc: 'Push and set upstream' },
      { cmd: 'git pull', desc: 'Pull from remote' },
      { cmd: 'git pull --rebase', desc: 'Pull with rebase' },
      { cmd: 'git fetch', desc: 'Download objects/refs from remote' },
      { cmd: 'git fetch --prune', desc: 'Fetch and remove stale branches' },
    ]
  },
  {
    title: 'Branching & Merging',
    color: '#8b5cf6',
    commands: [
      { cmd: 'git branch', desc: 'List local branches' },
      { cmd: 'git branch -r', desc: 'List remote branches' },
      { cmd: 'git branch -a', desc: 'List all branches' },
      { cmd: 'git branch <name>', desc: 'Create new branch' },
      { cmd: 'git checkout <branch>', desc: 'Switch to branch' },
      { cmd: 'git checkout -b <branch>', desc: 'Create and switch to new branch' },
      { cmd: 'git switch <branch>', desc: 'Switch branches (newer syntax)' },
      { cmd: 'git switch -c <branch>', desc: 'Create and switch (newer syntax)' },
      { cmd: 'git merge <branch>', desc: 'Merge branch into current' },
      { cmd: 'git merge --no-ff <branch>', desc: 'Merge with no fast-forward' },
      { cmd: 'git branch -d <branch>', desc: 'Delete local branch' },
      { cmd: 'git branch -D <branch>', desc: 'Force delete branch' },
      { cmd: 'git push origin --delete <branch>', desc: 'Delete remote branch' },
      { cmd: 'git branch -m <new-name>', desc: 'Rename current branch' },
    ]
  },
  {
    title: 'History & Logging',
    color: '#10b981',
    commands: [
      { cmd: 'git log', desc: 'View commit history' },
      { cmd: 'git log --oneline', desc: 'Compact commit history' },
      { cmd: 'git log --graph --oneline', desc: 'Graphical commit history' },
      { cmd: 'git log --stat', desc: 'Show stats for changed files' },
      { cmd: 'git log -p', desc: 'Show patch (changes) for each commit' },
      { cmd: 'git log --since="2 weeks ago"', desc: 'Filter by time' },
      { cmd: 'git log --author="name"', desc: 'Filter by author' },
      { cmd: 'git log -S "function_name"', desc: 'Search by code changes' },
      { cmd: 'git show <commit>', desc: 'Show details of a commit' },
      { cmd: 'git diff', desc: 'Show unstaged changes' },
      { cmd: 'git diff --staged', desc: 'Show staged changes' },
      { cmd: 'git diff <commit1> <commit2>', desc: 'Compare two commits' },
      { cmd: 'git blame <file>', desc: 'Show who changed each line' },
    ]
  },
  {
    title: 'Undoing & Resetting',
    color: '#ef4444',
    commands: [
      { cmd: 'git restore <file>', desc: 'Discard unstaged changes' },
      { cmd: 'git restore --staged <file>', desc: 'Unstage file' },
      { cmd: 'git reset', desc: 'Unstage all files' },
      { cmd: 'git reset --soft <commit>', desc: 'Undo commits, keep changes staged' },
      { cmd: 'git reset --mixed <commit>', desc: 'Undo commits, keep changes unstaged' },
      { cmd: 'git reset --hard <commit>', desc: 'Completely undo to commit' },
      { cmd: 'git revert <commit>', desc: 'Create new commit that undoes changes' },
      { cmd: 'git clean -fd', desc: 'Remove untracked files and directories' },
      { cmd: 'git checkout -- <file>', desc: 'Discard changes in working directory' },
    ]
  },
  {
    title: 'Stashing',
    color: '#ec4899',
    commands: [
      { cmd: 'git stash', desc: 'Stash changes' },
      { cmd: 'git stash save "message"', desc: 'Stash with message' },
      { cmd: 'git stash pop', desc: 'Apply and remove stash' },
      { cmd: 'git stash apply', desc: 'Apply stash without removing' },
      { cmd: 'git stash list', desc: 'List all stashes' },
      { cmd: 'git stash show stash@{0}', desc: 'Show stash changes' },
      { cmd: 'git stash drop stash@{0}', desc: 'Delete specific stash' },
      { cmd: 'git stash clear', desc: 'Delete all stashes' },
      { cmd: 'git stash branch <name>', desc: 'Create branch from stash' },
    ]
  },
  {
    title: 'Rebasing',
    color: '#f59e0b',
    commands: [
      { cmd: 'git rebase <branch>', desc: 'Rebase current branch onto another' },
      { cmd: 'git rebase -i HEAD~3', desc: 'Interactive rebase (last 3 commits)' },
      { cmd: 'git rebase --continue', desc: 'Continue after resolving conflicts' },
      { cmd: 'git rebase --abort', desc: 'Abort rebase operation' },
      { cmd: 'git rebase --skip', desc: 'Skip current commit' },
    ]
  },
  {
    title: 'Tags',
    color: '#06b6d4',
    commands: [
      { cmd: 'git tag', desc: 'List tags' },
      { cmd: 'git tag <tagname>', desc: 'Create lightweight tag' },
      { cmd: 'git tag -a <tagname> -m "message"', desc: 'Create annotated tag' },
      { cmd: 'git push origin <tagname>', desc: 'Push tag to remote' },
      { cmd: 'git push origin --tags', desc: 'Push all tags to remote' },
      { cmd: 'git tag -d <tagname>', desc: 'Delete local tag' },
      { cmd: 'git push origin --delete <tagname>', desc: 'Delete remote tag' },
      { cmd: 'git checkout <tagname>', desc: 'Checkout tag' },
    ]
  },
  {
    title: 'Advanced & Debugging',
    color: '#8b5cf6',
    commands: [
      { cmd: 'git bisect start', desc: 'Start binary search for bugs' },
      { cmd: 'git bisect good <commit>', desc: 'Mark commit as good' },
      { cmd: 'git bisect bad <commit>', desc: 'Mark commit as bad' },
      { cmd: 'git bisect reset', desc: 'End bisect session' },
      { cmd: 'git reflog', desc: 'Show reference logs (recovery tool)' },
      { cmd: 'git cherry-pick <commit>', desc: 'Apply specific commit' },
      { cmd: 'git worktree add <path> <branch>', desc: 'Add working tree' },
      { cmd: 'git submodule add <url>', desc: 'Add submodule' },
      { cmd: 'git submodule update --init --recursive', desc: 'Initialize submodules' },
      { cmd: 'git gc', desc: 'Cleanup unnecessary files' },
      { cmd: 'git fsck', desc: 'Verify repository integrity' },
    ]
  },
  {
    title: 'Remote Operations',
    color: '#84cc16',
    commands: [
      { cmd: 'git remote add <name> <url>', desc: 'Add new remote' },
      { cmd: 'git remote rename <old> <new>', desc: 'Rename remote' },
      { cmd: 'git remote remove <name>', desc: 'Remove remote' },
      { cmd: 'git remote show origin', desc: 'Show remote info' },
      { cmd: 'git push origin <branch>', desc: 'Push branch to remote' },
      { cmd: 'git push origin --all', desc: 'Push all branches to remote' },
      { cmd: 'git push --force-with-lease', desc: 'Force push safely' },
      { cmd: 'git pull origin <branch>', desc: 'Pull specific branch' },
      { cmd: 'git fetch origin', desc: 'Fetch from origin' },
    ]
  }
]

const filtered = computed(() => {
  if (!search.value) return categories
  const q = search.value.toLowerCase()
  return categories
    .map(cat => ({
      ...cat,
      commands: cat.commands.filter(c =>
        c.cmd.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q)
      )
    }))
    .filter(cat => cat.commands.length > 0)
})

const copy = (text) => navigator.clipboard.writeText(text)
</script>

<style scoped>
.container {
  min-height: 100vh;
  /* background: #0d1117; */
  color: #c9d1d9;
  padding: 2rem 1rem;
  font-family: ui-monospace, Menlo, Monaco, monospace;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
  padding-top: 8rem;
}

.title {
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(90deg, #ffa500, #ff6b6b, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #8b949e;
  font-size: 1.2rem;
}

.search {
  max-width: 500px;
  margin: 0 auto 3rem;
  display: block;
  width: 100%;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid #30363d;
  background: #161b22;
  color: white;
  font-size: 1.1rem;
  outline: none;
}

.search:focus {
  border-color: #58a6ff;
}

.grid {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 4rem;
}

.card {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.card-header {
  padding: 1rem 1.5rem;
  font-weight: bold;
  font-size: 1.2rem;
  color: white;
}

.command-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.command-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 1.5rem;
  border-bottom: 1px solid #30363d;
  transition: background 0.2s;
}

.command-item:last-child {
  border-bottom: none;
}

.command-item:hover {
  background: #21262d;
}

.cmd {
  font-weight: bold;
  color: #58a6ff;
  display: block;
  margin-bottom: 0.3rem;
}

.desc {
  color: #8b949e;
  font-size: 0.95rem;
}

.copy-btn {
  background: #21262d;
  border: 1px solid #30363d;
  color: #58a6ff;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.2s;
}

.copy-btn:hover {
  background: #30363d;
}

.no-results {
  text-align: center;
  font-size: 1.5rem;
  margin-top: 4rem;
  color: #8b949e;
}
</style>
