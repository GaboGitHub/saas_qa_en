# Summary of My Approach

For this challenge, I want to be transparent: I am not very experienced with Kubernetes, Helm, and Tilt at this level, so I approached it step by step. I had to do some trial-and-error, consult Helm's official documentation and I ask AI for help with some commands and validations.
Even so, I was able to understand what was going on and get to a working solution.

### Initial Setup & Kube Context Issues

I started by running Tilt, but the first blocker was that my `kube` context pointed to old clusters from a previous job. Tilt has a safety feature that refused to run because it thought my context might be a production environment. Here is the error I encountered:

```
Loading Tiltfile at: /Users/gabriel/Desktop/saas_qa_en/challenge-2-install-detective/Tiltfile
Traceback (most recent call last):
  /Users/gabriel/Desktop/saas_qa_en/challenge-2-install-detective/Tiltfile:8:15: in <toplevel>
Error in local: Refusing to run 'local' because cux-dev-cluster might be a production kube context.
If you're sure you want to continue add:
	allow_k_contexts('cux-dev-cluster')
before this function call in your Tiltfile. Otherwise, switch k8s contexts and restart Tilt.
```

To resolve this, I first backed up my `kube` config (just in case) and then removed all the old `cux-` contexts. I set my current context to `docker-desktop`, and after that, Tilt was able to deploy the chart correctly.

### Investigation with Tilt

Once Tilt was running, the UI gave me a clear overview of the deployment status:
*   ✅ The **frontend** pod was OK.
*   ❌ The **API** and **worker** pods were stuck and would not start.

From there, I investigated the errors and found three main problems.

### Problem Analysis & Resolution

**1. Missing ConfigMap**

The API and worker deployments were referencing a `ConfigMap` that didn't exist. Based on the official documentation (https://helm.sh/docs/chart_template_guide/getting_started/#a-first-template) I added a `configmap.yaml` to the Helm templates, and Tilt automatically redeployed the chart. After that, those pods started successfully. (https://helm.sh/docs/chart_template_guide/accessing_files/)

**2. Health Check Mistakes**

The API was starting but then crashing. I checked the pod's probes and noticed two issues:
1.  A typo in the endpoint path (`/healt` instead of `/health`).
2.  A hardcoded port that didn't match the one in `values.yaml` (https://helm.sh/docs/chart_template_guide/values_files).

I fixed both issues, and after that the API stayed up and stable.

**3. Unrealistic Memory Limit in Frontend**

The frontend's memory limit was set to an extremely low `8Mi`. I replaced it with templated values so it would use the proper resource limits defined in `values.yaml`. (https://stackoverflow.com/questions/63250666/helm-get-values-depending-on-environment)

After applying those fixes, all pods became `Ready (1/1)` in the Tilt UI.

### Automated Installation Test

Finally, I wrote a simple installation test script that:
1.  Waits for all pods to be ready.
2.  Port-forwards to the API service.
3.  Calls an endpoint to verify that the API responds correctly.

I also added a `trap` to the script to clean up the `port-forward` process reliably, which fixed a race condition I found in my initial version. After that change, the test script ran end-to-end successfully.

### Conclusion

So even though I am not an expert in this area, I was able to fix the chart and get the deployment stable with combination of investigation on the official documentation, trial-and-error, checking logs, and verifying my assumptions with AI.
