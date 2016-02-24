presentOrg = (org) ->
  if org && org.publicKey
    org.publicKeyShort = "#{org.publicKey[0..8]}...#{org.publicKey[-6..-1]}"
  org

presentUser = (user) ->
  if user && user.publicKey
    user.publicKeyShort = "#{user.publicKey[0..8]}...#{user.publicKey[-6..-1]}"
  user
